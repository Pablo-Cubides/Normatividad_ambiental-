import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/normas/route';

describe('/api/normas', () => {
  beforeEach(() => {
    // Clear cache before each test
    jest.clearAllMocks();
  });

  it('should return error for missing pais parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('País');
  });

  it('should use default dominio when not specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?pais=argentina');
    const res = await GET(req);
    // API uses default dominio='agua' when not specified
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('domain');
    expect(data.domain).toBe('agua');
  });

  it('should return error for invalid dominio', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=invalid&pais=argentina');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Dominio no válido');
  });

  it('should return error for invalid pais', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=nonexistent');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('País');
  });

  it('should return data for valid dominio and pais', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    // API returns full JSON structure with registros/records, not wrapped in 'normas'
    expect(data).toHaveProperty('registros'); // Spanish version
    expect(data).toHaveProperty('pais');
    expect(data).toHaveProperty('domain');
    expect(Array.isArray(data.registros)).toBe(true);
  });

  it('should include cache headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
    const res = await GET(req);
    expect(res.headers.get('Cache-Control')).toContain('public');
    expect(res.headers.has('X-Cache-Status')).toBe(true);
  });

  it('should return cache HIT on second request', async () => {
    const url = 'http://localhost:3000/api/normas?dominio=agua&pais=chile';
    
    // First request - should be MISS
    const req1 = new NextRequest(url);
    const res1 = await GET(req1);
    expect(res1.headers.get('X-Cache-Status')).toBe('MISS');

    // Second request - should be HIT
    const req2 = new NextRequest(url);
    const res2 = await GET(req2);
    expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
  });
});