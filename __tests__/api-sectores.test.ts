import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/sectores/route';

describe('/api/sectores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return message when pais not specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('pais');
  });

  it('should return error for invalid dominio', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=invalid&pais=argentina');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Dominio no válido');
  });

  it('should return message for invalid pais', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua&pais=nonexistent');
    const res = await GET(req);
    // validateCountry returns null, API treats as missing and returns 200 with message
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message || data.sectors).toBeDefined();
  });

  it('should return sectors for valid dominio and pais', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua&pais=argentina');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('sectors');
    expect(Array.isArray(data.sectors)).toBe(true);
  });

  it('should include cache headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua&pais=argentina');
    const res = await GET(req);
    expect(res.headers.get('Cache-Control')).toContain('public');
    expect(res.headers.has('X-Cache-Status')).toBe(true);
  });

  it('should return cache HIT on second request', async () => {
    const url = 'http://localhost:3000/api/sectores?dominio=agua&pais=argentina';
    
    const req1 = new NextRequest(url);
    const res1 = await GET(req1);
    // May be HIT if previous test cached it, just check it has status
    expect(res1.headers.has('X-Cache-Status')).toBe(true);

    const req2 = new NextRequest(url);
    const res2 = await GET(req2);
    expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
  });

  it('should return normalized sectors', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua&pais=argentina');
    const res = await GET(req);
    const data = await res.json();
    
    // Verify sectors are strings
    data.sectors.forEach((sector: any) => {
      expect(typeof sector).toBe('string');
    });
  });

  it('should handle vertimientos dominio with sectors', async () => {
    const req = new NextRequest('http://localhost:3000/api/sectores?dominio=vertimientos&pais=colombia');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('sectors');
  });
});