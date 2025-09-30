const fs = require('fs');
const path = require('path');

function listCountries(domain) {
  const dir = path.join(process.cwd(), 'data', 'json', domain);
  if (!fs.existsSync(dir)) return [];
  // Strict policy: only consider files without hyphens in their basename
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('-'));
  const countriesMap = {};

  // Only consider canonical (no-hyphen) files. Include a file only when it contains
  // a top-level `country` string and at least `sectors` (non-empty) or `normativeReference`.
  const canonicalCandidates = [];
  for (const f of files) {
    const base = f.replace(/\.json$/i, '');
    const lowerBase = base.toLowerCase();
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
        countriesMap[lowerBase] = countryName.trim() || lowerBase;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  const canonicalSet = new Set(canonicalCandidates.map(f => f.replace(/\.json$/i, '').toLowerCase()));

  // Hyphenated files are ignored under the strict policy

  // include candidates
  const candDir = path.join(process.cwd(), 'data', 'json-candidates', domain);
  if (fs.existsSync(candDir)) {
    const candFiles = fs.readdirSync(candDir).filter(f => f.endsWith('.json'));
    for (const cf of candFiles) {
      const m = cf.match(/^([a-zA-Z0-9_-]+)-/);
      if (!m) continue;
      const prefix = (m[1] || '').toLowerCase();
      if (countriesMap[prefix]) continue;
      try {
        const txt = fs.readFileSync(path.join(candDir, cf), 'utf8');
        const obj = JSON.parse(txt);
        const name = obj.country || obj.pais || obj.name || prefix;
        countriesMap[prefix] = name;
      } catch (e) {
        countriesMap[prefix] = countriesMap[prefix] || prefix;
      }
    }
  }

  const countries = Object.keys(countriesMap).map(code => ({ code, name: countriesMap[code] }));
  // Final sanitization: drop slug-like codes that look normative
  const isSlugLike = (code, name) => {
    if (!code) return true;
    if (code.length > 40) return true;
    const tokens = code.split('-');
    if (tokens.length > 6) return true;
    const normWords = /(ley|residuo|residuos|politica|marco|norma|proyecto|resolucion|decreto|pnrs|pnr)/i;
    if (normWords.test(code) || normWords.test(name)) return true;
    return false;
  };

  const filtered = Object.keys(countriesMap)
    .filter(code => !isSlugLike(code, String(countriesMap[code] || '')))
    .map(code => ({ code, name: countriesMap[code] }));

  filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
  return countries;
}

const domain = process.argv[2] || 'residuos-solidos';
console.log(JSON.stringify({ domain, countries: listCountries(domain) }, null, 2));
