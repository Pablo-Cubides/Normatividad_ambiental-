const { spawnSync } = require('child_process');
const path = require('path');

test('scripts/validate-json.js completes without syntax errors', () => {
  const script = path.join(__dirname, '..', 'Norms_app', 'scripts', 'validate-json.js');
  const res = spawnSync(process.execPath, [script], { encoding: 'utf8', cwd: path.join(__dirname, '..') });
  // Print stdout/stderr to help debugging if it fails
  if (res.stdout) console.log(res.stdout);
  if (res.stderr) console.error(res.stderr);
  expect(res.status).toBe(0);
});
