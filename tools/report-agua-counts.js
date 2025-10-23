#!/usr/bin/env node
/*
  Script: report-agua-counts.js
  Purpose: Reads agua domain JSON files and prints a table with:
  index, country, number of sectors, and parameters per sector.
*/
const fs = require('fs');
const path = require('path');

const AGUA_DIR = path.resolve(__dirname, '..', 'data', 'json', 'agua');

function listCountryFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.json'))
    .map((d) => path.join(dir, d.name));
}

function safeReadJSON(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { __error: e.message, __file: file };
  }
}

function getCountryName(obj, filePath) {
  return (
    obj.country ||
    obj.pais ||
    obj.paisNombre ||
    path.basename(filePath).replace(/\.json$/i, '').replace(/-/g, ' ')
  );
}

function formatSectorLabel(key, sectorObj) {
  const name = sectorObj && (sectorObj.name || sectorObj.nombre);
  return name ? `${key} (${name})` : key;
}

function generateReport() {
  if (!fs.existsSync(AGUA_DIR)) {
    console.error('No se encontró el directorio de datos:', AGUA_DIR);
    process.exit(1);
  }

  const files = listCountryFiles(AGUA_DIR);
  if (files.length === 0) {
    console.error('No se encontraron archivos JSON de agua en', AGUA_DIR);
    process.exit(1);
  }

  const rows = [];
  for (const file of files) {
    const data = safeReadJSON(file);
    if (data.__error) {
      rows.push({ country: getCountryName({}, file), sectorsCount: 0, sectors: [], error: data.__error });
      continue;
    }
    const country = getCountryName(data, file);
    const sectorsObj = data.sectors && typeof data.sectors === 'object' ? data.sectors : {};
    const sectorKeys = Object.keys(sectorsObj);
    const sectorsCount = sectorKeys.length;
    const sectors = sectorKeys.map((key) => {
      const s = sectorsObj[key] || {};
      const params = Array.isArray(s.parameters) ? s.parameters : [];
      return { key, label: formatSectorLabel(key, s), parametersCount: params.length };
    });
    rows.push({ country, sectorsCount, sectors });
  }

  // Sort by country name for readability
  rows.sort((a, b) => ('' + a.country).localeCompare('' + b.country, 'es'));

  // Print table header
  console.log('Idx | País | # Sectores | Parámetros por sector');
  console.log('----|------|------------|-----------------------');

  rows.forEach((r, idx) => {
    const sectorSummary = r.sectors
      .map((s) => `${s.label}: ${s.parametersCount}`)
      .join(' | ');
    console.log(`${idx + 1} | ${r.country} | ${r.sectorsCount} | ${sectorSummary}`);
  });

  // Footer summary
  const countriesWithSectors = rows.filter((r) => r.sectorsCount > 0).length;
  console.log('\nTotal de países (archivos):', rows.length);
  console.log('Países con sectores definidos:', countriesWithSectors);
}

generateReport();
