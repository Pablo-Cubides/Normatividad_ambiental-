const fs = require('fs');
const path = require('path');

test('data/json/residuos-solidos/colombia.json exists and is valid JSON', () => {
  const p = path.join(__dirname, '..', 'Norms_app', 'data', 'json', 'residuos-solidos', 'colombia.json');
  expect(fs.existsSync(p)).toBe(true);
  const txt = fs.readFileSync(p, 'utf8');
  expect(() => JSON.parse(txt)).not.toThrow();
});
