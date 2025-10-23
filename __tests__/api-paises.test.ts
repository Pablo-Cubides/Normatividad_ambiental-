import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/paises/route';

describe('/api/paises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return countries list when no dominio specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/paises');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('countries');
    expect(Array.isArray(data.countries)).toBe(true);
  });

  it('should return countries list for valid dominio', async () => {
    const req = new NextRequest('http://localhost:3000/api/paises?dominio=agua');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('countries');
    expect(Array.isArray(data.countries)).toBe(true);
    expect(data.countries.length).toBeGreaterThan(0);
  });

  it('should return countries for calidad-aire dominio', async () => {
    const req = new NextRequest('http://localhost:3000/api/paises?dominio=calidad-aire');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('countries');
    expect(Array.isArray(data.countries)).toBe(true);
  });

  it('should include cache headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/paises?dominio=agua');
    const res = await GET(req);
    expect(res.headers.get('Cache-Control')).toContain('public');
    expect(res.headers.has('X-Cache-Status')).toBe(true);
  });

  it('should return cache HIT on second request', async () => {
    const url = 'http://localhost:3000/api/paises?dominio=vertimientos';
    
    const req1 = new NextRequest(url);
    const res1 = await GET(req1);
    expect(res1.headers.get('X-Cache-Status')).toBe('MISS');

    const req2 = new NextRequest(url);
    const res2 = await GET(req2);
    expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
  });

  it('should return countries with code and name structure', async () => {
    const req = new NextRequest('http://localhost:3000/api/paises?dominio=agua');
    const res = await GET(req);
    const data = await res.json();
    
    expect(data.countries.length).toBeGreaterThan(0);
    
    // Check structure of first country
    const firstCountry = data.countries[0];
    expect(firstCountry).toHaveProperty('code');
    expect(firstCountry).toHaveProperty('name');
    expect(typeof firstCountry.code).toBe('string');
    expect(typeof firstCountry.name).toBe('string');
  });

  it('should return countries for all valid dominios', async () => {
    const validDominios = ['agua', 'calidad-aire', 'residuos-solidos', 'vertimientos'];
    
    for (const dominio of validDominios) {
      const req = new NextRequest(`http://localhost:3000/api/paises?dominio=${dominio}`);
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.countries).toBeDefined();
    }
  });
});