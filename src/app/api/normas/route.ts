import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { UnifiedNormSchema } from '../../../lib/schemas';
import { ZodError } from 'zod';
import { appendFileSync } from 'fs';
import { normalizeData, mergeCandidates } from '../../../lib/utils';
import { logger } from '@/lib/logger';
import { REGULATORY_SOURCES, RegulatorySource, validateDomain, validateCountry, validateSector, sanitizeFilename } from '@/lib/constants';
import { SECTOR_NORMALIZATION_MAP } from '@/lib/types';

// Narrower types to avoid `any` throughout this file
type AnyRecord = Record<string, unknown>;
type MatchedSource = { name: string; url: string; description?: string };

// Enhanced in-memory cache with LRU-like behavior
interface CacheEntry {
  ts: number;
  value: unknown;
  hits: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 15; // 15 minutes (increased from 5)
const MAX_CACHE_SIZE = 100; // Prevent memory leaks

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

/**
 * Country-specific sector name mappings
 * When a normalized sector name needs to map to different raw names per country
 */
const COUNTRY_SECTOR_OVERRIDES: Record<string, Record<string, string>> = {
  argentina: {
    "recreacion": "actividades_recreativas",
    "vida-acuatica": "proteccion_vida_acuatica",
  },
  // Add more country-specific overrides as needed
};

/**
 * Desnormalize a sector ID from normalized form (with hyphens) to raw form (with underscores)
 * E.g., "agua-potable" -> "agua_potable" or "riego" -> "uso_agricola"
 * Strategy:
 * 1. Check country-specific overrides first
 * 2. Look for inverse mapping in SECTOR_NORMALIZATION_MAP
 * 3. Fall back to simple hyphen -> underscore replacement
 */
function denormalizeSector(normalizedSector: string, country?: string): string {
  // Strategy 1: Country-specific overrides
  if (country && COUNTRY_SECTOR_OVERRIDES[country]?.[normalizedSector]) {
    const override = COUNTRY_SECTOR_OVERRIDES[country][normalizedSector];
    
    return override;
  }
  
  // Strategy 2: Look for an explicit inverse mapping
  // This handles special cases where normalized name != simple underscore version
  // (e.g., reuso -> reuso_agricola)
  for (const [raw, normalized] of Object.entries(SECTOR_NORMALIZATION_MAP)) {
    if (normalized === normalizedSector) {
      // Prefer raw names that use underscores (the actual JSON keys)
      if (raw.includes('_') && !raw.includes('-')) {
        
        return raw;
      }
    }
  }
  
  // Strategy 3: Simple replacement (fallback: agua-potable -> agua_potable)
  const simpleReplacement = normalizedSector.replace(/-/g, '_');
  
  return simpleReplacement;
}

/**
 * Normalize response format so frontend doesn't need domain-specific logic
 * - For AGUA: convert sectors object into flat records with sector info
 * - For other domains: keep records as-is
 * - Filter by sector if provided
 * - Add regulatory sources for the country-domain combination
 */
export function normalizeResponseFormat(data: AnyRecord, domain: string, country: string, sectorFilter?: string) {
  const result: AnyRecord = { ...(data || {}) };
  

  // For AGUA and VERTIMIENTOS domains: restructure sectors into records
  if ((domain === 'agua' || domain === 'vertimientos') && data.sectors && typeof data.sectors === 'object') {
  const allRecords: AnyRecord[] = [];
  let sectorNormativeReference: string | undefined = undefined;
    
    // First, determine which sector we're looking at (if any)
    // If sectorFilter is provided, denormalize it to match the raw JSON keys
    let activeSector: string | null = null;
    if (sectorFilter && sectorFilter !== 'todos') {
      activeSector = denormalizeSector(sectorFilter, country);
      
    }
    
    // Iterate through sectors
    for (const [sectorId, sectorData] of Object.entries(data.sectors || {})) {
      const sector = sectorData as AnyRecord;
      
      // If we have a specific sector filter
      if (activeSector !== null) {
        // Only process the matching sector
        if (sectorId === activeSector) {
          
          
          // Add only parameters from this sector
          if (Array.isArray(sector.parameters)) {
            (sector.parameters as unknown[]).forEach((param) => {
              const p = (param ?? {}) as AnyRecord;
              // Normalize parameter field names (parametro -> parameter, limite -> limit, unidad -> unit)
              const normalized: AnyRecord = {
                parameter: p.parameter || p.parametro,
                limit: p.limit || p.limite,
                unit: p.unit || p.unidad,
                notes: p.notes || p.notas,
                _sector: sectorId,
                _sectorName: (sector.name as string) || sectorId,
              };
              allRecords.push(normalized);
            });
          }
          
          // Capture this sector's normative reference (safely cast if present)
          if (sector['normativeReference'] && typeof sector['normativeReference'] === 'string') {
            sectorNormativeReference = sector['normativeReference'] as string;
          }
          
          break; // We found our sector, no need to continue
        }
      } else {
        // If no filter, add all sectors
        
        if (Array.isArray(sector.parameters)) {
          (sector.parameters as unknown[]).forEach((param) => {
            const p = (param ?? {}) as AnyRecord;
            // Normalize parameter field names (parametro -> parameter, limite -> limit, unidad -> unit)
            const normalized: AnyRecord = {
              parameter: p.parameter || p.parametro,
              limit: p.limit || p.limite,
              unit: p.unit || p.unidad,
              notes: p.notes || p.notas,
              _sector: sectorId,
              _sectorName: (sector.name as string) || sectorId,
            };
            allRecords.push(normalized);
          });
        }
        
        // Use first sector's normative reference as default (safe check)
        if (!sectorNormativeReference && sector['normativeReference'] && typeof sector['normativeReference'] === 'string') {
          sectorNormativeReference = sector['normativeReference'] as string;
        }
      }
    }
    
    // Store sectors structure for frontend that wants it
    result._sectors = JSON.parse(JSON.stringify(data.sectors)); // clone to allow enrichment
    result.records = allRecords;
    result.registros = allRecords;

    // Attach regulatory sources (we use them below to enrich per-sector normative URLs)
  const countryKey = String(country).toLowerCase();
  const countryDomainSources: RegulatorySource[] = (REGULATORY_SOURCES[countryKey] && REGULATORY_SOURCES[countryKey][domain]) ? REGULATORY_SOURCES[countryKey][domain] : [];
    result.sources = countryDomainSources;
    if (Array.isArray(result.sources) && (result.sources as RegulatorySource[]).length > 0) {
      
    } else {
      
    }

    // Enrich each sector with normativeSources by matching its normativeReference, name or other text against the country-domain sources
    try {
      const normalizeText = (t: unknown) => (t ? String(t).toLowerCase().trim() : '');
      for (const [sId, sData] of Object.entries(result._sectors || {})) {
        const s = (sData || {}) as AnyRecord;
        const candidates: string[] = [];
        if (!s) continue;
        // Collect candidate strings to match: explicit normativeReference, the sector name, any localized fields
        if (s['normativeReference']) candidates.push(String(s['normativeReference']));
        if (s['normativeReference_es']) candidates.push(String(s['normativeReference_es']));
        if (s['name']) candidates.push(String(s['name']));
        if (s['title']) candidates.push(String(s['title']));

        const foundMatches: MatchedSource[] = [];

        for (const cand of candidates) {
          const candNorm = normalizeText(cand);
          if (!candNorm) continue;
          // Extract common standard codes (GB 5749-2022, GB 3838, etc.) to improve matching across languages
          const codeMatches = String(cand).match(/\bGB\s*\d{2,6}(?:-\d{2,6})?\b/ig) || [];
          const normalizedCodes = codeMatches.map((c: string) => normalizeText(c.replace(/\s+/g, ' ')));
          for (const src of countryDomainSources) {
            const name = normalizeText(src.name);
            const desc = normalizeText(src.description);
            // matching heuristics: any direction inclusion
            if ((name && name.includes(candNorm)) || (desc && desc.includes(candNorm)) || (candNorm.includes(name) && name.length > 3) || (candNorm.includes(desc) && desc.length > 3)) {
              // avoid duplicates
              if (!foundMatches.find((f) => f.url === src.url)) {
                foundMatches.push({ name: src.name, url: src.url, description: src.description });
              }
            }
            // Try matching by extracted standard codes (e.g. 'gb 5749-2022')
            for (const code of normalizedCodes) {
              if ((name && name.includes(code)) || (desc && desc.includes(code))) {
                if (!foundMatches.find((f) => f.url === src.url)) {
                  foundMatches.push({ name: src.name, url: src.url, description: src.description });
                }
              }
            }
          }
          // Also try split candidates (comma separated list of standards)
          const parts = String(cand).split(/,|;| y | and /i).map(p => p.trim()).filter(Boolean);
          for (const p of parts) {
            const pNorm = normalizeText(p);
            if (!pNorm || pNorm === candNorm) continue;
            for (const src of countryDomainSources) {
              const name = normalizeText(src.name);
              const desc = normalizeText(src.description);
              if ((name && name.includes(pNorm)) || (desc && desc.includes(pNorm)) || (pNorm.includes(name) && name.length > 3)) {
                if (!foundMatches.find((f) => f.url === src.url)) {
                  foundMatches.push({ name: src.name, url: src.url, description: src.description });
                }
              }
            }
          }
        }

        if (foundMatches.length > 0) {
          (s as AnyRecord)['normativeSources'] = foundMatches;
          (s as AnyRecord)['normativeUrl'] = foundMatches[0].url;
          (s as AnyRecord)['normativeSourceName'] = foundMatches[0].name;
          
        }
      }
    } catch (e) {
      
    }

    // Use the captured normative reference (and attempt to attach a URL)
    if (sectorNormativeReference) {
      result.normativeReference = sectorNormativeReference;
      result.normativeReference_es = sectorNormativeReference;
      // Try to find a URL for the top-level normative reference
      // Ensure result.sources is an array of RegulatorySource before searching
      const sourcesArray = Array.isArray(result.sources) ? (result.sources as RegulatorySource[]) : [];
      const topFound = sourcesArray.find((src) => ((src.name || '').toString().toLowerCase().includes(String(sectorNormativeReference).toLowerCase())));
      if (topFound) (result as AnyRecord)['normativeReference_url'] = topFound.url;
      
    }

      // Fallback: if we have a top-level normativeReference_es (e.g. "GB 5749-2022, GB 3838-2002")
      // but individual sectors didn't receive `normativeSources`, try to split and map sources
      // to likely sectors using simple keyword heuristics (potable vs superficiales).
      try {
        const topRef = result.normativeReference_es || result.normativeReference || '';
          if (topRef && Array.isArray(result.sources) && (result.sources as unknown[]).length > 0) {
          const topLower = String(topRef).toLowerCase();
          // keywords for potable vs superficial/waterbody
          const potableKeys = ['potable', 'drinking', 'gb 5749', 'agua potable'];
          const superficialKeys = ['superficial', 'surface', 'gb 3838', 'aguas superficiales', 'calidad ambiental'];

            for (const src of (result.sources as RegulatorySource[])) {
            const sName = String(src.name || '').toLowerCase();
            const sDesc = String(src.description || '').toLowerCase();
            // decide target sectors
            const targets: string[] = [];
            if (potableKeys.some(k => sName.includes(k) || sDesc.includes(k) || topLower.includes(k))) {
              targets.push('agua_potable');
            }
            if (superficialKeys.some(k => sName.includes(k) || sDesc.includes(k) || topLower.includes(k))) {
              // map to any sector that looks like 'aguas_superficiales' or contains 'superficiales'
              const superficialSectorKeys = Object.keys(result._sectors || {}).filter(k => /superficial|superficiales|superficie|clase/i.test(k));
              if (superficialSectorKeys.length > 0) targets.push(...superficialSectorKeys);
            }

            // If no specific heuristic matched, skip
            if (targets.length === 0) continue;

              for (const t of new Set(targets)) {
              const sectors = (result._sectors || {}) as Record<string, AnyRecord>;
              const sectorObj = sectors[t] as AnyRecord | undefined;
              if (!sectorObj) continue;
              sectorObj['normativeSources'] = sectorObj['normativeSources'] ?? [];
              if (!(sectorObj['normativeSources'] as MatchedSource[]).find((f) => f.url === src.url)) {
                (sectorObj['normativeSources'] as MatchedSource[]).push({ name: src.name, url: src.url, description: src.description });
              }
              // ensure normativeUrl/normativeSourceName exist
              if (!sectorObj['normativeUrl']) {
                sectorObj['normativeUrl'] = src.url;
                sectorObj['normativeSourceName'] = src.name;
              }
              
            }
          }
        }
      } catch (e) {
        
      }

      // Additional explicit mapping: if the top-level normative reference contains known standard codes
      // (e.g. GB 5749, GB 3838), assign matching sources directly to common sector keys to guarantee UI links.
      try {
        const topRef = String(result.normativeReference_es || result.normativeReference || '').toLowerCase();
        if (topRef) {
          // extract standard codes like 'gb 5749' or 'gb5749-2022'
          const codes = Array.from(new Set((String(topRef).match(/\bgb\s*\d{2,6}(?:-\d{2,6})?\b/ig) || []).map(c => c.toLowerCase().replace(/\s+/g, ''))));
          if (codes.length > 0 && Array.isArray(result.sources) && (result.sources as unknown[]).length > 0) {
            const sourcesForCodes = result.sources as RegulatorySource[];
            for (const code of codes) {
              // find sources that mention this code
              const matchedSources = sourcesForCodes.filter((s) => {
                const name = (s.name || '').toString().toLowerCase();
                const desc = (s.description || '').toString().toLowerCase();
                return name.includes(code) || desc.includes(code) || name.includes(code.replace(/gb/, '').trim());
              });

              if (matchedSources.length === 0) continue;

              // decide target sectors for known GB codes
              if (code.includes('5749')) {
                // Assign to potable sector
                const key = 'agua_potable';
                const sectors = (result._sectors || {}) as Record<string, AnyRecord>;
                const sectorObj = sectors[key];
                if (sectorObj) {
                  sectorObj.normativeSources = sectorObj.normativeSources || [];
                  for (const src of matchedSources as RegulatorySource[]) {
                        sectorObj['normativeSources'] = sectorObj['normativeSources'] ?? [];
                        if (!(sectorObj['normativeSources'] as MatchedSource[]).find((f) => f.url === src.url)) {
                          (sectorObj['normativeSources'] as MatchedSource[]).push({ name: src.name, url: src.url, description: src.description });
                        }
                  }
                  if (!sectorObj.normativeUrl) {
                        sectorObj['normativeUrl'] = (matchedSources as RegulatorySource[])[0].url;
                        sectorObj['normativeSourceName'] = (matchedSources as RegulatorySource[])[0].name;
                  }
                  
                }
              }

              if (code.includes('3838')) {
                // Assign to superficial sectors (any key that looks like 'aguas_superficiales')
                const sectors = (result._sectors || {}) as Record<string, AnyRecord>;
                const superficialKeys = Object.keys(sectors).filter(k => /superficial|superficiales|superficie|clase/i.test(k));
                for (const key of superficialKeys) {
                  const sectorObj = sectors[key];
                  if (!sectorObj) continue;
                  sectorObj['normativeSources'] = sectorObj['normativeSources'] ?? [];
                  for (const src of matchedSources as RegulatorySource[]) {
                    if (!(sectorObj['normativeSources'] as MatchedSource[]).find((f) => f.url === src.url)) {
                      (sectorObj['normativeSources'] as MatchedSource[]).push({ name: src.name, url: src.url, description: src.description });
                    }
                  }
                  if (!sectorObj['normativeUrl']) {
                    sectorObj['normativeUrl'] = (matchedSources as RegulatorySource[])[0].url;
                    sectorObj['normativeSourceName'] = (matchedSources as RegulatorySource[])[0].name;
                  }
                  
                }
              }
            }
          }
        }
      } catch (e) {
        
      }
  } else if (sectorFilter && sectorFilter !== 'todos' && Array.isArray(data.records)) {
    // For other domains with sector filter
  result.records = (data.records as AnyRecord[]).filter((r) => (r['_sector'] === sectorFilter || r['sector'] === sectorFilter));
    result.registros = result.records;
  }

  // Add regulatory sources if available
  const countryKey = country.toLowerCase();
  if (REGULATORY_SOURCES[countryKey] && REGULATORY_SOURCES[countryKey][domain]) {
    const srcs = REGULATORY_SOURCES[countryKey][domain] as RegulatorySource[];
    result.sources = srcs;
    
  } else {
    result.sources = [];
    
  }

  return result;
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryParam = searchParams.get('pais');
  const domainParam = searchParams.get('dominio') || 'agua';
  const sectorParam = searchParams.get('sector');

  // SECURITY: Validate all input parameters
  const country = validateCountry(countryParam);
  const domain = validateDomain(domainParam);
  const sector = validateSector(sectorParam);

  if (!country) {
    return NextResponse.json({ error: 'País no válido o no soportado' }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json({ error: 'Dominio no válido' }, { status: 400 });
  }

  const cacheKey = `norma:${domain}:${country}${sector ? `:${sector}` : ''}`;

  // Check cache first (PERFORMANCE BOOST)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    cached.hits++;
    logger.info('normas:cache_hit', { cacheKey, hits: cached.hits });
    
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
    const filePath = path.join(process.cwd(), 'data', 'json', domain, `${sanitizeFilename(country)}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `País no encontrado en el dominio "${domain}"` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const countryData = JSON.parse(fileContent);

    if (!('domain' in countryData) || !countryData.domain) {
      countryData.domain = domain;
    }

    const normalized = normalizeData(countryData);
    const mergedNormalized = mergeCandidates(normalized, domain, country);

    try {
      const validatedData = UnifiedNormSchema.parse(mergedNormalized);
      
      // NORMALIZATION LAYER: Convert agua's sectors into a flat records format
      // so frontend doesn't need to know about domain-specific structures
      const normalizedForFrontend = normalizeResponseFormat(validatedData, domain, country, sector || undefined);
      
      // Store in cache with hit tracking
      cache.set(cacheKey, { ts: Date.now(), value: normalizedForFrontend, hits: 0 });
      logger.info('normas:cache_set', { cacheKey, cacheSize: cache.size });
      
      return NextResponse.json(normalizedForFrontend, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Cache-Status': 'MISS',
        },
      });
    } catch (validationError) {
      const zerr = validationError as ZodError;
      logger.warn('normas:validation_failed', { domain, country, issues: zerr.issues });

      try {
        const logPath = path.join(process.cwd(), 'data', 'json', '_validation.log');
        const entry = `${new Date().toISOString()} | ${domain}/${country}.json | ${JSON.stringify(zerr.issues)}\n`;
        appendFileSync(logPath, entry, { encoding: 'utf8' });
      } catch (logErr) {
        logger.warn('normas:failed_write_validation_log', { domain, country, error: String(logErr) });
      }

        try {
        // Best-effort coercion using narrow unknown accesses instead of wide `any` casts
        type BestEffort = Partial<typeof mergedNormalized> & { records?: Record<string, unknown>[]; registros?: Record<string, unknown>[] };
        const bestEffort: BestEffort & Record<string, unknown> = { ...(mergedNormalized as object) } as BestEffort & Record<string, unknown>;

        const getStr = (v: unknown) => (typeof v === 'string' ? v : '');

        bestEffort.country = getStr(bestEffort.country) || getStr(bestEffort['pais']) || country;
        bestEffort.version = getStr(bestEffort.version) || getStr(bestEffort['lastUpdate']) || getStr(bestEffort['version']) || '';

        if (bestEffort.registros && !bestEffort.records) {
          bestEffort.records = bestEffort.registros;
        }

        if (Array.isArray(bestEffort.records)) {
          bestEffort.records = bestEffort.records.map((r: unknown) => {
            const rec = (r ?? {}) as Record<string, unknown>;
            const parameter = getStr(rec['parameter']) || getStr(rec['parametro']) || '';
            const limit = getStr(rec['limit']) || getStr(rec['limite']) || getStr(rec['lim']) || '';
            const unit = typeof rec['unit'] === 'string' ? String(rec['unit']) : (typeof rec['unidad'] === 'string' ? String(rec['unidad']) : null);
            const notes = Array.isArray(rec['notes']) ? (rec['notes'] as unknown[]).map(String) : (Array.isArray(rec['notas']) ? (rec['notas'] as unknown[]).map(String) : []);
            let reference: unknown = undefined;
            const refRaw = rec['reference'] ?? rec['referencia'];
            if (refRaw) {
              if (typeof refRaw === 'object' && refRaw !== null) {
                const rObj = refRaw as Record<string, unknown>;
                reference = { standard: getStr(rObj['standard']) || getStr(rObj['norma']) };
              } else {
                reference = { standard: String(refRaw) };
              }
            }
            const category = getStr(rec['category']) || getStr(rec['categoria']) || undefined;
            return { parameter, limit, unit, notes, reference, category };
          });
        }

        if (bestEffort.domain === 'agua' && !bestEffort.sectors) {
          bestEffort.sectors = bestEffort.sectors ?? {};
        }

        if (bestEffort.records && !bestEffort.registros) {
          bestEffort.registros = bestEffort.records.map((r: unknown) => {
            const rr = r as Record<string, unknown>;
            return {
              parametro: rr['parameter'] ? String(rr['parameter']) : undefined,
              limite: rr['limit'] ? String(rr['limit']) : undefined,
              unidad: rr['unit'] ? String(rr['unit']) : undefined,
              notas: Array.isArray(rr['notes']) ? (rr['notes'] as unknown[]).map(String) : undefined,
            };
          });
        }

        if (bestEffort.registros && !bestEffort.records) {
          bestEffort.records = bestEffort.registros.map((r: unknown) => {
            const rec = (r ?? {}) as Record<string, unknown>;
            return {
              parameter: rec['parametro'] ? String(rec['parametro']) : (rec['parameter'] ? String(rec['parameter']) : ''),
              limit: rec['limite'] ? String(rec['limite']) : (rec['limit'] ? String(rec['limit']) : ''),
              unit: rec['unidad'] ? String(rec['unidad']) : (rec['unit'] ? String(rec['unit']) : null),
              notes: Array.isArray(rec['notas']) ? (rec['notas'] as unknown[]).map(String) : (Array.isArray(rec['notes']) ? (rec['notes'] as unknown[]).map(String) : []),
            };
          });
        }

        const ref = bestEffort['reference'] ?? bestEffort['referencia'];
        if (ref && !(bestEffort['referencia'])) {
          if (typeof ref === 'object' && ref !== null) {
            const rObj = ref as Record<string, unknown>;
            bestEffort['referencia'] = { norma: getStr(rObj['standard']) || getStr(rObj['norma']) };
          }
        }
        if (bestEffort['referencia'] && !(bestEffort['reference'])) {
          const r = bestEffort['referencia'];
          if (typeof r === 'object' && r !== null) {
            const rObj = r as Record<string, unknown>;
            bestEffort['reference'] = { standard: getStr(rObj['norma']) || getStr(rObj['standard']) };
          } else {
            bestEffort['reference'] = { standard: String(r) };
          }
        }

        const result: Record<string, unknown> = { ...(bestEffort as object), _validation: zerr.flatten() };
        
        // Add regulatory sources even in error recovery path
        const countryKey = country.toLowerCase();
        if (REGULATORY_SOURCES[countryKey] && REGULATORY_SOURCES[countryKey][domain]) {
          result.sources = REGULATORY_SOURCES[countryKey][domain];
        } else {
          result.sources = [];
        }
        
        // Cache even error recovery responses
        cache.set(cacheKey, { ts: Date.now(), value: result, hits: 0 });
        
        return NextResponse.json(result, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'MISS',
          },
        });
      } catch (e) {
        logger.error('normas:coerce_failed', { domain, country, error: String(e) });
        return NextResponse.json(
          {
            error: 'La estructura del archivo de datos está corrupta o no es válida y no fue posible normalizarla automáticamente.',
            details: zerr.flatten(),
          },
          { status: 500 }
        );
      }
    }

  } catch (fileError) {
    logger.error('normas:file_error', { domain, country, error: String(fileError) });
    return NextResponse.json(
      { error: 'Error interno del servidor al leer el archivo.' },
      { status: 500 }
    );
  }
}
