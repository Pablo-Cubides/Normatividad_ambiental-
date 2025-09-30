const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    // skip invalid folder
    if (file === '_invalid') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function validate() {
  const base = path.join(process.cwd(), 'data');
  const targets = [path.join(base, 'json'), path.join(base, 'json-candidates')];
  let ok = true;
  for (const t of targets) {
    const files = walk(t).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const txt = fs.readFileSync(f, 'utf8');
        console.log(`Checking: ${f} (len=${txt.length})`);
        JSON.parse(txt);
      } catch (e) {
        ok = false;
        const txt = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
        console.error('Invalid JSON:', f, e.message);
        console.error('First 120 chars:', txt.slice(0, 120));
        console.error('Last 120 chars:', txt.slice(-120));
      }
    }
  }
  if (ok) console.log('All JSON files valid.');
  else process.exit(2);
}

if (require.main === module) validate();
