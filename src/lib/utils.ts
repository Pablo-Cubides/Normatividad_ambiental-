import { UnifiedNorm } from './schemas';

// Minimal normalize/merge helpers used by the API routes.
// These implement best-effort normalization to a consistent shape
// but avoid heavy logic; they are intentionally permissive.

export function normalizeData(raw: unknown): UnifiedNorm | unknown {
  // If already matches the expected shape, return as-is
  if (!raw || typeof raw !== 'object') {
    return {} as UnifiedNorm;
  }

  const obj = raw as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  // Map country names
  normalized.country = obj.country || obj.pais || obj.paisNombre || undefined;
  normalized.pais = obj.pais || obj.country || undefined;

  // Map domain
  normalized.domain = obj.domain || obj.dominio || undefined;
  normalized.dominio = obj.dominio || obj.domain || undefined;

  // Map version/lastUpdate
  normalized.version = obj.version || obj.lastUpdate || undefined;
  normalized.lastUpdate = obj.lastUpdate || obj.version || undefined;

  // Map normative reference
  normalized.normativeReference = obj.normativeReference || obj.fuentePrincipal || obj.normativeReference_es || undefined;
  normalized.normativeReference_es = obj.normativeReference_es || obj.fuentePrincipal || obj.normativeReference || undefined;

  // Map records/registros
  if (Array.isArray(obj.records)) {
    normalized.records = obj.records;
  } else if (Array.isArray(obj.registros)) {
    normalized.records = obj.registros;
  }

  if (Array.isArray(obj.registros)) {
    normalized.registros = obj.registros;
  } else if (Array.isArray(obj.records)) {
    normalized.registros = obj.records;
  }

  // Map reference/referencia
  if (obj.reference && typeof obj.reference === 'object') {
    normalized.reference = obj.reference;
  } else if (obj.referencia && typeof obj.referencia === 'object') {
    normalized.reference = obj.referencia;
  }

  if (obj.referencia && typeof obj.referencia === 'object') {
    normalized.referencia = obj.referencia;
  } else if (obj.reference && typeof obj.reference === 'object') {
    normalized.referencia = obj.reference;
  }

  // Map sectors
  if (obj.sectors && typeof obj.sectors === 'object') {
    normalized.sectors = obj.sectors;
  }

  return normalized as UnifiedNorm;
}

export function mergeCandidates(normalized: unknown, domain: string | null, country: string | null): UnifiedNorm | unknown {
  // Best-effort: attach domain/country if missing
  const base = (normalized && typeof normalized === 'object') ? { ...(normalized as Record<string, unknown>) } : {} as Record<string, unknown>;
  if (domain && !base.domain) base.domain = domain;
  if (country && !base.country) base.country = country;
  return base as UnifiedNorm;
}
