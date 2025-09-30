
import path from 'path';
import fs from 'fs';

// Normalizes Spanish/alternate keys into the canonical schema expected by Zod.
export const normalizeData = (raw: any) => {
  const out = { ...raw };

  // country/pais
  if (!out.country && out.pais) out.country = out.pais;

  // For water domain some files use 'normativeReference' / 'lastUpdate' already.
  if (!out.normativeReference && out.referencia && typeof out.referencia === 'string') {
    out.normativeReference = out.referencia;
  }

  // For record-based domains map spanish keys to English schema keys
  if ((out.registros && !out.records) || (out.referencia && !out.reference)) {
    if (out.registros && !out.records) {
      out.records = Array.isArray(out.registros)
        ? out.registros.map((r: any) => ({
            parameter: r.parametro ?? r.parameter,
            limit: r.limite ?? r.limit,
            unit: r.unidad ?? r.unit ?? null,
            notes: r.notas ?? r.notes ?? [],
            reference: r.referencia ? { standard: r.referencia.norma ?? r.referencia } : (r.reference ?? undefined),
            category: r.categoria ?? r.category ?? undefined,
          }))
        : out.registros;
    }

    if (out.referencia && !out.reference && typeof out.referencia === 'object') {
      out.reference = { standard: out.referencia.norma ?? out.referencia.standard };
    }
  }

  // Some older files use 'version' vs 'lastUpdate'
  if (!out.lastUpdate && out.version) out.lastUpdate = out.version;

  return out;
};

// Merge candidate sectors from data/json-candidates/<domain>/ that match this country.
export const mergeCandidates = (original: any, domain: string, country: string) => {
  try {
    const candidatesDir = path.join(process.cwd(), 'data', 'json-candidates', domain);
    if (!fs.existsSync(candidatesDir)) return original;

    const files = fs.readdirSync(candidatesDir);
    const countryPrefix = (country || '').toLowerCase();

    const merged = { ...original, _candidates: [] };
    merged.sectors = merged.sectors ?? {};

    for (const f of files) {
      const lower = f.toLowerCase();
      if (!lower.startsWith(countryPrefix + '-')) continue;
      const full = path.join(candidatesDir, f);
      try {
        const txt = fs.readFileSync(full, 'utf8');
        const cand = JSON.parse(txt);
        if (cand && cand.sectors) {
          for (const [key, val] of Object.entries(cand.sectors)) {
            if (!merged.sectors[key]) {
              // annotate candidate provenance
              let sect: any = val;
              if (val && typeof val === 'object' && !Array.isArray(val)) {
                sect = { ...val };
                sect._candidate = true;
                sect._candidateSource = `json-candidates/${domain}/${f}`;
              }
              merged.sectors[key] = sect as any;
            }
          }
          (merged._candidates as any[]).push(f);
        }
      } catch (e) {
        console.error('Failed to read/parse candidate', full, e);
      }
    }

    return merged;
  } catch (e) {
    console.error('Error merging candidates:', e);
    return original;
  }
};
