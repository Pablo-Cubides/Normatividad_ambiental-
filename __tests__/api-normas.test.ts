import { NextRequest } from 'next/server';
import { GET as getNormas } from '../src/app/api/normas/route';

// Mock fs and path
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

const mockFs = require('fs');
const mockPath = require('path');

describe('/api/normas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns normas data for valid country and domain', async () => {
    // Mock file system
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockReturnValue(['colombia.json']);
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path.includes('colombia.json')) {
        return JSON.stringify({
          country: 'Colombia',
          domain: 'agua',
          normativeReference: 'Test Reference',
          records: [
            { parameter: 'pH', limit: '6.5-8.5', unit: 'pH units' }
          ]
        });
      }
      return '{}';
    });
    mockFs.appendFileSync.mockImplementation(() => {});
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));

    const request = new NextRequest('http://localhost:3000/api/normas?pais=colombia&dominio=agua');
    const response = await getNormas(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.country).toBe('Colombia');
    expect(data.domain).toBe('agua');
    expect(Array.isArray(data.records)).toBe(true);
  });

  it('returns 404 for invalid country', async () => {
    mockFs.existsSync.mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/normas?pais=invalid&dominio=agua');
    const response = await getNormas(request);

    expect(response.status).toBe(404);
  });
});