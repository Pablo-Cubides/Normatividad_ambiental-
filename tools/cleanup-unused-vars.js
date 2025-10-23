#!/usr/bin/env node
/**
 * Script: cleanup-unused-vars.js
 * Purpose: Remove unused variable declarations identified by ESLint
 * Usage: node tools/cleanup-unused-vars.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const isDryRun = process.argv.includes('--dry-run');

const CHANGES = [
  {
    file: 'src/app/api/normas/route.ts',
    line: 68,
    remove: "const getArr = Array.isArray(get) ? get : [get];",
    description: "Remove unused 'getArr' variable"
  },
  {
    file: 'src/app/api/paises/route.ts',
    line: 16,
    remove: "export function isValidISOCountryCode(code: string): boolean {",
    removeBlock: true,
    endLine: 18, // Assuming it's a 3-line function
    description: "Remove unused 'isValidISOCountryCode' function"
  },
  {
    file: 'src/app/explorar/page.tsx',
    line: 12,
    find: /import\s+\{[^}]*SectorStandards[^}]*\}/,
    replace: (match) => match.replace(/,?\s*SectorStandards\s*,?/, ''),
    description: "Remove unused 'SectorStandards' import"
  },
  {
    file: 'src/app/explorar/page.tsx',
    line: 12,
    find: /import\s+\{[^}]*WaterQualityParameter[^}]*\}/,
    replace: (match) => match.replace(/,?\s*WaterQualityParameter\s*,?/, ''),
    description: "Remove unused 'WaterQualityParameter' import"
  }
];

function applyChanges() {
  console.log('═'.repeat(80));
  console.log(isDryRun ? '🔍 DRY RUN - No files will be modified' : '🛠️  CLEANUP - Removing unused variables');
  console.log('═'.repeat(80));
  console.log();

  let changesApplied = 0;

  CHANGES.forEach((change, idx) => {
    const filePath = path.resolve(__dirname, '..', change.file);
    
    console.log(`[${idx + 1}/${CHANGES.length}] ${change.description}`);
    console.log(`   File: ${change.file}`);

    if (!fs.existsSync(filePath)) {
      console.log('   ❌ File not found\n');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (change.find && change.replace) {
      const newContent = content.replace(change.find, change.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    } else if (change.remove) {
      const lines = content.split('\n');
      const lineToRemove = change.remove;
      const newLines = lines.filter(line => !line.trim().includes(lineToRemove.trim()));
      
      if (newLines.length !== lines.length) {
        content = newLines.join('\n');
        modified = true;
      }
    }

    if (modified) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('   ✅ Removed\n');
      } else {
        console.log('   ✓ Would be removed\n');
      }
      changesApplied++;
    } else {
      console.log('   ℹ️  Already clean or not found\n');
    }
  });

  console.log('═'.repeat(80));
  console.log(`📊 Summary: ${changesApplied}/${CHANGES.length} changes ${isDryRun ? 'would be' : 'were'} applied`);
  console.log('═'.repeat(80));

  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Cleanup complete! Run `npm run lint` to verify');
  }
}

applyChanges();
