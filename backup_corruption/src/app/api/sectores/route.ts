import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { SECTOR_NORMALIZATION_MAP } from '@/lib/types';
import path from 'path';
import fs from 'fs';
import { validateDomain, validateCountry, sanitizeFilename } from '@/lib/constants';

// Enhanced in-memory cache
interface CacheEntry {
  ts: number;
  value: unknown;
  hits: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 15; // 15 minutes
const MAX_CACHE_SIZE = 100;

function cleanupCache() {
  if (cache.size < MAX_CACHE_SIZE) return;
  
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  for (const [key, entry] of entries) {
    if (now - entry.ts > TTL_MS) {
      cache.delete(key);
    }
  }
  
  if (cache.size >= MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].hits - b[1].hits);
    const toRemove = sorted.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainParam = searchParams.get('dominio') || 'agua';
    const countryParam = searchParams.get('pais');

    // SECURITY: Validate input parameters
    const domain = validateDomain(domainParam);
    const country = validateCountry(countryParam);

    if (!domain) {
      return NextResponse.json({ sectors: [], error: 'Dominio no válido' }, { status: 400 });
    }

    const cacheKey = `sectors:${domain}:${country || 'none'}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      cached.hits++;
      logger.info('sectores:cache_hit', { cacheKey, hits: cached.hits });
      
      return NextResponse.json(cached.value, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Cache-Status': 'HIT',
        },
      });
    }

    cleanupCache();

    // If country is specified, read sectors from that country's JSON
    if (country) {
      const filePath = path.join(process.cwd(), 'data', 'json', domain, `${sanitizeFilename(country)}.json`);
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ sectors: [], domain, country, error: 'País no encontrado' }, { status: 404 });
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const countryData = JSON.parse(fileContent);

      let rawSectors: string[] = [];

      // For agua and vertimientos domains: sectors are in countryData.sectors object keys
      if (countryData.sectors && typeof countryData.sectors === 'object') {
        rawSectors = Object.keys(countryData.sectors);
      }
      // For other domains (calidad-aire, residuos-solidos): 
      // they don't have subsections by sector - all data is in registros[]
      // In this case, return empty sectors array or a single "todos" sector
      else {
        rawSectors = ['todos'];
      }

      // Normalizar sectores: aplicar el mapa de normalización para unificar variantes
      const normalizedSectors = Array.from(
        new Set(
          rawSectors.map(s => SECTOR_NORMALIZATION_MAP[s] || s)
        )
      ).sort();

      logger.info(`sectores:listed_for_country`, { domain, country, rawCount: rawSectors.length, normalizedCount: normalizedSectors.length });

      const result = { sectors: normalizedSectors, domain, country, count: normalizedSectors.length };
      
      // Store in cache
      cache.set(cacheKey, { ts: Date.now(), value: result, hits: 0 });

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Cache-Status': 'MISS',
        },
      });
    }

    // If no country specified, return empty sectors (client should select country first)
    logger.info(`sectores:listed_all_countries_required`, { domain });
    
    const result = { sectors: [], domain, message: 'Se requiere especificar un país (pais query param)' };
    
    // Cache this too
    cache.set(cacheKey, { ts: Date.now(), value: result, hits: 0 });
    
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    logger.error('Error fetching sectors', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { sectors: [], error: 'Error al cargar sectores' },
      { status: 500 }
    );
  }
}
