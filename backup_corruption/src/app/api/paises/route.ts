import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { logger } from '@/lib/logger';
import { validateDomain } from '@/lib/constants';

// Enhanced in-memory cache with LRU-like behavior
interface CacheEntry {
  ts: number;
  value: unknown;
  hits: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 15; // 15 minutes (increased from 5)
const MAX_CACHE_SIZE = 50;

// Cache cleanup function
function cleanupCache() {
  if (cache.size < MAX_CACHE_SIZE) return;
  
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Remove expired entries first
  for (const [key, entry] of entries) {
    if (now - entry.ts > TTL_MS) {
      cache.delete(key);
    }
  }
  
  // If still over limit, remove least recently used
  if (cache.size >= MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].hits - b[1].hits);
    const toRemove = sorted.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

// ISO 3166-1 alpha-2 country codes (subset for Latin America and relevant countries)
// Note: Currently not used but kept for future validation
// const VALID_ISO_CODES = new Set([
//   'ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'uy', 've',
//   'us', 'ca', 'es', 'pt', 'it', 'fr', 'de', 'gb', 'jp', 'cn', 'in', 'au', 'nz'
// ]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domainParam = searchParams.get('dominio');

  // SECURITY: Validate domain parameter
  const domain = validateDomain(domainParam);

  const cacheKey = `countries:${domain || 'all'}`;

  // Check cache first (PERFORMANCE BOOST)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    cached.hits++;
    logger.info('countries:cache_hit', { domain: domain || 'all', hits: cached.hits });
    
    return NextResponse.json(cached.value, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'X-Cache-Status': 'HIT',
      },
    });
  }

  // Cleanup cache periodically
  cleanupCache();

  try {
    const jsonDir = path.join(process.cwd(), 'data', 'json');
    const domains = domain ? [domain] : fs.readdirSync(jsonDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
      .map(dirent => dirent.name);

    const countriesMap: Record<string, string> = {};

    for (const d of domains) {
      const dir = path.join(jsonDir, d);
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

      for (const f of files) {
        const base = f.replace(/\.json$/i, '');
        const code = base.toLowerCase();
        try {
          const txt = fs.readFileSync(path.join(dir, f), 'utf8');
          const obj = JSON.parse(txt);
          const countryName = obj.country || obj.pais;
          if (obj && typeof countryName === 'string' && countryName.length > 0) {
            countriesMap[code] = countryName.trim() || code;
          }
        } catch {
          // skip files we can't parse as JSON
        }
      }
    }

    const countries = Object.keys(countriesMap)
      .map(code => ({ code, name: countriesMap[code] }));

    // Sort alphabetically by name
    countries.sort((a, b) => a.name.localeCompare(b.name));

    const result = { countries };
    
    // Store in cache with hit tracking
    cache.set(cacheKey, { ts: Date.now(), value: result, hits: 0 });
    logger.info('countries:cache_set', { domain: domain || 'all', count: countries.length, cacheSize: cache.size });
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (e) {
    logger.error('Error listing countries', { domain: domain || 'all', error: String(e) });
    return NextResponse.json({ countries: [] }, { status: 500 });
  }
}
