const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const backupsDir = path.join(path.dirname(path.dirname(filePath)), '_backups');
  ensureDir(backupsDir);
  const base = path.basename(filePath);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(backupsDir, `${base}.${stamp}.bak`);
  fs.copyFileSync(filePath, dest);
  return dest;
}

function promote() {
  const candidatesRoot = path.join(process.cwd(), 'data', 'json-candidates');
  if (!fs.existsSync(candidatesRoot)) {
    console.log('No candidates directory found.');
    return;
  }

  const domains = fs.readdirSync(candidatesRoot).filter(d => fs.statSync(path.join(candidatesRoot, d)).isDirectory());
  for (const domain of domains) {
    const candDir = path.join(candidatesRoot, domain);
    const files = fs.readdirSync(candDir).filter(f => f.endsWith('.json'));
    const targetDir = path.join(process.cwd(), 'data', 'json', domain);
    ensureDir(targetDir);

    for (const f of files) {
      const m = f.match(/^([a-zA-Z0-9_-]+)-/);
      if (!m) continue;
      const countryKey = m[1].toLowerCase();
      const candPath = path.join(candDir, f);
      try {
        const txt = fs.readFileSync(candPath, 'utf8');
        const cand = JSON.parse(txt);

        const targetPath = path.join(targetDir, `${countryKey}.json`);
        let target = {};
        if (fs.existsSync(targetPath)) {
          const existing = fs.readFileSync(targetPath, 'utf8');
          try { target = JSON.parse(existing); } catch (e) { console.warn('Existing target JSON malformed, will be replaced by merged object.', targetPath); target = {}; }
          backupFile(targetPath);
        }

        // Merge: preserve existing sectors, add sectors from candidate when missing
        target = target || {};
        target.country = target.country || cand.country || countryKey;
        target.normativeReference = target.normativeReference || cand.normativeReference || '';
        target.lastUpdate = target.lastUpdate || cand.lastUpdate || '';
        target.sectors = target.sectors || {};

        if (cand.sectors) {
          for (const [k, v] of Object.entries(cand.sectors)) {
            if (!target.sectors[k]) {
              target.sectors[k] = v;
              // annotate provenance
              if (typeof target.sectors[k] === 'object' && !Array.isArray(target.sectors[k])) {
                target.sectors[k]._candidate = true;
                target.sectors[k]._candidateSource = path.relative(process.cwd(), candPath).replace(/\\/g, '/');
              }
            }
          }
        }

        // Add metadata
        target._publishedAt = new Date().toISOString();
        target._publishedFrom = target._publishedFrom || path.relative(process.cwd(), candPath).replace(/\\/g, '/');

        fs.writeFileSync(targetPath, JSON.stringify(target, null, 2), 'utf8');
        console.log(`Promoted candidate ${f} -> ${domain}/${countryKey}.json`);
      } catch (e) {
        console.error('Failed to promote candidate', f, e);
      }
    }
  }
}

if (require.main === module) promote();
