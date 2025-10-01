import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/paises/route';

// Mock fs and path
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

const mockFs = require('fs');
const mockPath = require('path');

describe('/api/paises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns countries for agua domain', async () => {
    // Mock file system
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockReturnValue(['colombia.json', 'brasil.json']);
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path.includes('colombia.json')) {
        return JSON.stringify({ country: 'Colombia', normativeReference: 'Test' });
      }
      if (path.includes('brasil.json')) {
        return JSON.stringify({ country: 'Brasil', normativeReference: 'Test' });
      }
      return '{}';
    });
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));

    const request = new NextRequest('http://localhost:3000/api/paises?dominio=agua');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.countries).toBeDefined();
    expect(Array.isArray(data.countries)).toBe(true);
  });

  it('returns empty array for invalid domain', async () => {
    mockFs.existsSync.mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/paises?dominio=invalid');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.countries).toEqual([]);
  });
});