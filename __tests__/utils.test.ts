import { normalizeData, mergeCandidates } from '../src/lib/utils';

jest.mock('fs', () => ({ existsSync: jest.fn(), readdirSync: jest.fn(), readFileSync: jest.fn(), }));
jest.mock('path', () => ({ join: (...args: string[]) => args.join('/') }));
const mockFs = require('fs');

describe('utils.normalizeData', () => {
  it('maps spanish keys to canonical ones', () => {
    const raw = { pais: 'Colombia', registros: [{ parametro: 'pH', limite: '7' }], referencia: { norma: 'Ley' }, version: '2020' };
    const out = normalizeData(raw);
    expect(out.country).toBe('Colombia');
    expect(Array.isArray(out.records)).toBe(true);
    expect(out.lastUpdate).toBe('2020');
    expect(out.reference).toBeDefined();
  });
});

describe('utils.mergeCandidates', () => {
  it('returns original when no candidates dir', () => {
    mockFs.existsSync.mockReturnValue(false);
    const original = { country: 'co' };
    const out = mergeCandidates(original, 'agua', 'co');
    expect(out.country).toBe('co');
    expect(out._candidates).toBeUndefined();
  });
});
