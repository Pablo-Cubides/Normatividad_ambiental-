#!/usr/bin/env node
/**
 * Script: validate-all-json.js
 * Purpose: Validate all JSON files against Zod schemas
 * Usage: node tools/validate-all-json.js [domain]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'json');
const DOMAINS = ['agua', 'calidad-aire', 'residuos-solidos', 'vertimientos'];

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function validateJSON(filePath, domain) {
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Basic structure validation
    const hasCountry = data.country || data.pais || data.paisNombre;
    const hasData = data.sectors || data.registros || data.records;
    const hasDomain = data.domain || data.dominio;

    if (!hasCountry) {
      results.warnings.push('Missing country/pais field');
    }

    if (!hasData) {
      results.errors.push('Missing data fields (sectors/registros/records)');
      results.valid = false;
    }

    if (!hasDomain) {
      results.warnings.push(`Missing domain field (expected: ${domain})`);
    } else if (data.domain !== domain && data.dominio !== domain) {
      results.warnings.push(`Domain mismatch: file in ${domain}/ but has domain=${data.domain || data.dominio}`);
    }

    // Validate sectors structure (for agua domain)
    if (domain === 'agua' && data.sectors) {
      const sectorKeys = Object.keys(data.sectors);
      if (sectorKeys.length === 0) {
        results.warnings.push('sectors object is empty');
      }

      sectorKeys.forEach(key => {
        const sector = data.sectors[key];
        if (!sector.name && !sector.nombre) {
          results.warnings.push(`Sector ${key} missing name`);
        }
        if (!Array.isArray(sector.parameters) && !Array.isArray(sector.parametros)) {
          results.errors.push(`Sector ${key} missing parameters array`);
          results.valid = false;
        }
      });
    }

    // Validate registros array
    if (Array.isArray(data.registros)) {
      data.registros.forEach((reg, idx) => {
        if (!reg.parametro && !reg.parameter) {
          results.warnings.push(`Record ${idx} missing parametro/parameter`);
        }
        if (!reg.limite && !reg.limit && !reg.value) {
          results.warnings.push(`Record ${idx} missing limite/limit/value`);
        }
      });
    }

  } catch (error) {
    if (error instanceof SyntaxError) {
      results.errors.push(`Invalid JSON syntax: ${error.message}`);
    } else {
      results.errors.push(`Error reading file: ${error.message}`);
    }
    results.valid = false;
  }

  return results;
}

function validateDomain(domain) {
  const domainDir = path.join(DATA_DIR, domain);
  
  if (!fs.existsSync(domainDir)) {
    log(colors.yellow, `⚠️  Domain directory not found: ${domain}`);
    return { total: 0, valid: 0, invalid: 0, warnings: 0 };
  }

  const files = fs.readdirSync(domainDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));

  if (files.length === 0) {
    log(colors.yellow, `⚠️  No JSON files found in ${domain}/`);
    return { total: 0, valid: 0, invalid: 0, warnings: 0 };
  }

  let stats = { total: files.length, valid: 0, invalid: 0, warnings: 0 };

  log(colors.cyan, `\n📂 Validating ${domain}/ (${files.length} files)...`);
  console.log('─'.repeat(80));

  files.forEach(file => {
    const filePath = path.join(domainDir, file);
    const result = validateJSON(filePath, domain);

    if (result.valid && result.warnings.length === 0) {
      stats.valid++;
      log(colors.green, `✓ ${file}`);
    } else if (result.valid && result.warnings.length > 0) {
      stats.valid++;
      stats.warnings++;
      log(colors.yellow, `⚠ ${file}`);
      result.warnings.forEach(w => {
        console.log(`  └─ Warning: ${w}`);
      });
    } else {
      stats.invalid++;
      log(colors.red, `✗ ${file}`);
      result.errors.forEach(e => {
        console.log(`  └─ Error: ${e}`);
      });
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => {
          console.log(`  └─ Warning: ${w}`);
        });
      }
    }
  });

  return stats;
}

function main() {
  const targetDomain = process.argv[2];

  console.log('═'.repeat(80));
  log(colors.blue, '🔍 JSON Validation Tool - Normativa Ambiental');
  console.log('═'.repeat(80));

  const domainsToValidate = targetDomain 
    ? [targetDomain] 
    : DOMAINS;

  const allStats = {
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: 0
  };

  domainsToValidate.forEach(domain => {
    const stats = validateDomain(domain);
    allStats.total += stats.total;
    allStats.valid += stats.valid;
    allStats.invalid += stats.invalid;
    allStats.warnings += stats.warnings;
  });

  // Summary
  console.log('\n' + '═'.repeat(80));
  log(colors.blue, '📊 VALIDATION SUMMARY');
  console.log('═'.repeat(80));
  console.log(`Total files:     ${allStats.total}`);
  log(colors.green, `✓ Valid:         ${allStats.valid}`);
  log(colors.red, `✗ Invalid:       ${allStats.invalid}`);
  log(colors.yellow, `⚠ With warnings: ${allStats.warnings}`);
  console.log();

  if (allStats.invalid > 0) {
    log(colors.red, '❌ Validation FAILED - Fix errors above');
    process.exit(1);
  } else if (allStats.warnings > 0) {
    log(colors.yellow, '⚠️  Validation PASSED with warnings');
    process.exit(0);
  } else {
    log(colors.green, '✅ Validation PASSED - All files are valid!');
    process.exit(0);
  }
}

main();
