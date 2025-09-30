const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = [
  path.join(ROOT, 'data', 'json'),
  path.join(ROOT, 'data', 'json-candidates'),
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function moveFileToInvalid(filePath) {
  const dir = path.dirname(filePath);
  const invalidDir = path.join(dir, '_invalid');
  await ensureDir(invalidDir);
  const base = path.basename(filePath);
  const dest = path.join(invalidDir, base);
  await fs.rename(filePath, dest);
  console.log(`Moved invalid JSON: ${filePath} -> ${dest}`);
}

async function checkFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return;
    if (path.extname(filePath).toLowerCase() !== '.json') return;
    const content = await fs.readFile(filePath, 'utf8');
    if (!content || content.trim().length === 0) {
      await moveFileToInvalid(filePath);
      return;
    }
    JSON.parse(content);
  } catch (err) {
    // any error => consider file invalid and move it
    try {
      await moveFileToInvalid(filePath);
    } catch (moveErr) {
      console.error(`Failed to move invalid file ${filePath}:`, moveErr);
    }
  }
}

async function walkAndCheck(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === '_invalid') continue;
      await walkAndCheck(full);
    } else {
      await checkFile(full);
    }
  }
}

async function main() {
  for (const d of TARGET_DIRS) {
    console.log('Scanning', d);
    await walkAndCheck(d);
  }
  console.log('Done scanning.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
