import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { logger } from '@/lib/logger';

// Simple in-memory cache with TTL for small dataset (serverless-safe only for single instance)
const cache: Record<string, { ts: number; value: unknown }> = {};
const TTL_MS = 1000 * 60 * 5; // 5 minutes

// ISO 3166-1 alpha-2 country codes (subset for Latin America and relevant countries)
const VALID_ISO_CODES = new Set([
  'ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'uy', 've',
  'us', 'ca', 'es', 'pt', 'it', 'fr', 'de', 'gb', 'jp', 'cn', 'in', 'au', 'nz'
]);

function isValidISOCountryCode(code: string): boolean {
  return VALID_ISO_CODES.has(code.toLowerCase());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('dominio') || 'agua';
  const cacheKey = `countries:${domain}`;

  // serve from cache when fresh
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < TTL_MS) {
    logger.info('countries:cache:hit', { domain });
    return NextResponse.json(cached.value as unknown);
  }

    try {
    const dir = path.join(process.cwd(), 'data', 'json', domain);
    if (!fs.existsSync(dir)) {
      const empty = { countries: [] };
      cache[cacheKey] = { ts: Date.now(), value: empty };
      return NextResponse.json(empty);
    }

    // Strict policy: only consider files whose basename does NOT contain a hyphen
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const countriesMap: Record<string, string> = {};

    // Only consider canonical (no-hyphen) files. Include a file only when it contains
    // a top-level `country` string and at least `sectors` (non-empty) or `normativeReference`.
    const canonicalCandidates: string[] = [];
    for (const f of files) {
      const base = f.replace(/\.json$/i, '');
      const code = base.toLowerCase();
      try {
        const txt = fs.readFileSync(path.join(dir, f), 'utf8');
        const obj = JSON.parse(txt);
        const countryName = obj.country || obj.pais;
        if (
          obj &&
          typeof countryName === 'string' && countryName.length > 0 &&
          (
            (obj.sectors && typeof obj.sectors === 'object' && Object.keys(obj.sectors).length > 0) ||
            (obj.normativeReference && typeof obj.normativeReference === 'string' && obj.normativeReference.length > 0) ||
            (obj.registros && Array.isArray(obj.registros) && obj.registros.length > 0) // Also consider files with records
          )
        ) {
          canonicalCandidates.push(f);
          countriesMap[code] = countryName.trim() || code;
        }
      } catch (_) {
        // skip files we can't parse as JSON
      }
    }

    // Also inspect json-candidates for this domain: files named <country>-*.json
    try {
      const candDir = path.join(process.cwd(), 'data', 'json-candidates', domain);
      if (fs.existsSync(candDir)) {
        const candFiles = fs.readdirSync(candDir).filter(f => f.endsWith('.json'));
        for (const cf of candFiles) {
          const m = cf.match(/^([a-zA-Z0-9_-]+)-/);
          if (!m) continue;
          const prefix = (m[1] || '').toLowerCase();

          // If we already have a canonical country matching this prefix, skip candidate.
          if (countriesMap[prefix]) continue;

          // try to read candidate to get a nicer name
          try {
            const txt = fs.readFileSync(path.join(candDir, cf), 'utf8');
            const obj = JSON.parse(txt);
            const name = obj.country || obj.pais || obj.name || prefix;
            countriesMap[prefix] = name;
          } catch (_) {
            countriesMap[prefix] = countriesMap[prefix] || prefix;
          }
        }
      }
    } catch (_e) {
      logger.warn('Failed reading candidates dir', { domain, error: String(_e) });
    }

    // Final sanitization: drop slug-like codes that look normative
    const isSlugLike = (code: string, name: string) => {
      if (!code) return true;
      // very long codes are almost certainly slugs
      if (code.length > 40) return true;
      // codes that are just numbers or symbols are not countries
      if (!/^[a-zA-Z]/.test(code)) return true;
      const tokens = code.split('-');
      if (tokens.length > 6) return true;
      // blacklist common normative words
      const normWords = /(ley|residuo|residuos|politica|marco|norma|proyecto|resolucion|decreto|pnrs|pnr)/i;
      if (normWords.test(code) || normWords.test(name)) return true;
      return false;
    };

    const countries = Object.keys(countriesMap)
      .filter(code => !isSlugLike(code, String(countriesMap[code] || '')))
      
      .map(code => ({ code, name: countriesMap[code] }));

    // Sort alphabetically by name
    countries.sort((a, b) => a.name.localeCompare(b.name));

    const result = { countries };
    cache[cacheKey] = { ts: Date.now(), value: result };
    logger.info('countries:listed', { domain, count: countries.length });
    return NextResponse.json(result);
  } catch (e) {
    logger.error('Error listing countries for domain', { domain, error: String(e) });
    return NextResponse.json({ countries: [] }, { status: 500 });
  }
}
