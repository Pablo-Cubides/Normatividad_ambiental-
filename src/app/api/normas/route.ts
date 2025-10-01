import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { UnifiedNormSchema } from '../../../lib/schemas';
import { ZodError } from 'zod';
import { appendFileSync } from 'fs';
import { normalizeData, mergeCandidates } from '../../../lib/utils';
import { logger } from '@/lib/logger';

// Simple in-memory cache for norma responses
const cache: Record<string, { ts: number; value: unknown }> = {};
const TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('pais');
  const domain = searchParams.get('dominio') || 'agua'; // Default to 'agua'

  const cacheKey = `norma:${domain}:${country}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < TTL_MS) {
    logger.info('normas:cache:hit', { domain, country });
    return NextResponse.json(cached.value as unknown);
  }

  if (!country) {
    return NextResponse.json({ error: 'El parámetro "pais" es requerido' }, { status: 400 });
  }

    try {
    const filePath = path.join(process.cwd(), 'data', 'json', domain, `${country.toLowerCase()}.json`);

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
      return NextResponse.json(validatedData);
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
        const getArr = (v: unknown) => (Array.isArray(v) ? v as unknown[] : []);

        bestEffort.country = getStr(bestEffort.country) || getStr(bestEffort['pais']) || country;
        bestEffort.version = getStr(bestEffort.version) || getStr(bestEffort['lastUpdate']) || getStr(bestEffort['version']) || '';

        if (bestEffort.registros && !bestEffort.records) {
          bestEffort.records = bestEffort.registros;
        }

        if (Array.isArray(bestEffort.records)) {
          bestEffort.records = bestEffort.records.map((r) => {
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
          bestEffort.registros = bestEffort.records.map((r) => {
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
          bestEffort.records = bestEffort.registros.map((r) => {
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

        const result = { ...(bestEffort as object), _validation: zerr.flatten() };
        cache[cacheKey] = { ts: Date.now(), value: result };
        return NextResponse.json(result);
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