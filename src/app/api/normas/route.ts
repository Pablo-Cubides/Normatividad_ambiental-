import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { UnifiedNormSchema } from '../../../lib/schemas';
import { ZodError } from 'zod';
import { appendFileSync } from 'fs';
import { normalizeData, mergeCandidates } from '../../../lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('pais');
  const domain = searchParams.get('dominio') || 'agua'; // Default to 'agua'

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
      console.error(`Validation error for ${domain}/${country}.json:`, zerr.issues);

      try {
        const logPath = path.join(process.cwd(), 'data', 'json', '_validation.log');
        const entry = `${new Date().toISOString()} | ${domain}/${country}.json | ${JSON.stringify(zerr.issues)}\n`;
        appendFileSync(logPath, entry, { encoding: 'utf8' });
      } catch (logErr) {
        console.error('Failed to write validation log:', logErr);
      }

      try {
        const bestEffort: any = { ...mergedNormalized };

        bestEffort.country = String(bestEffort.country ?? bestEffort.pais ?? country);
        bestEffort.version = String(bestEffort.version ?? bestEffort.lastUpdate ?? bestEffort.version ?? '');

        if (bestEffort.registros && !bestEffort.records) {
          bestEffort.records = bestEffort.registros;
        }

        if (Array.isArray(bestEffort.records)) {
          bestEffort.records = bestEffort.records.map((r: any) => ({
            parameter: String(r.parameter ?? r.parametro ?? ''),
            limit: String(r.limit ?? r.limite ?? r.lim ?? ''),
            unit: r.unit ?? r.unidad ?? null,
            notes: Array.isArray(r.notes) ? r.notes.map(String) : (Array.isArray(r.notas) ? r.notas.map(String) : []),
            reference: r.reference ?? (r.referencia ? { standard: String(r.referencia.norma ?? r.referencia) } : undefined),
            category: r.category ?? r.categoria ?? undefined,
          }));
        }

        if (bestEffort.domain === 'agua' && !bestEffort.sectors) {
          bestEffort.sectors = bestEffort.sectors ?? {};
        }

        if (bestEffort.records && !bestEffort.registros) bestEffort.registros = bestEffort.records.map((r: any) => ({ parametro: r.parameter, limite: r.limit, unidad: r.unit, notas: r.notes }));
        if (bestEffort.registros && !bestEffort.records) bestEffort.records = bestEffort.registros.map((r: any) => ({ parameter: r.parametro ?? r.parameter, limit: r.limite ?? r.limit, unit: r.unidad ?? r.unit ?? null, notes: r.notas ?? r.notes ?? [] }));

        if (bestEffort.reference && !bestEffort.referencia) bestEffort.referencia = { norma: bestEffort.reference.standard };
        if (bestEffort.referencia && !bestEffort.reference) bestEffort.reference = { standard: bestEffort.referencia.norma ?? bestEffort.referencia };

        return NextResponse.json({ ...bestEffort, _validation: zerr.flatten() });
      } catch (e) {
        console.error('Failed to coerce normalized data for frontend fallback:', e);
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
    console.error(`API error for country ${country} and domain ${domain}:`, fileError);
    return NextResponse.json(
      { error: 'Error interno del servidor al leer el archivo.' },
      { status: 500 }
    );
  }
}