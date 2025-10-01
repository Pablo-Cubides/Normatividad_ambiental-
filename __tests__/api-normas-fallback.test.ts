import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/normas/route';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
}));

jest.mock('path', () => ({ join: (...args: string[]) => args.join('/') }));

const mockFs = require('fs');

describe('/api/normas fallback behavior', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns fallback best-effort when validation fails', async () => {
    // Mock file exists and returns an object missing required schema parts
    mockFs.existsSync.mockReturnValue(true);
    const badContent = JSON.stringify({ pais: 'Colombia', registros: [{ parametro: 'pH', limite: '6.5-8.5' }] });
    mockFs.readFileSync.mockReturnValue(badContent);

    const request = new NextRequest('http://localhost/api/normas?pais=co&dominio=agua');
    const res = await GET(request);
    const data = await res.json();

    expect(res.status).toBe(200);
    // fallback should include records/registros normalized fields
    expect(data).toBeDefined();
    expect(data.registros || data.records).toBeDefined();
    expect(data.country || data.pais).toBeDefined();
  });
});
