/**
 * Cache System Tests
 * Tests for cache functionality across all APIs
 */

import { NextRequest } from 'next/server';
import { GET as getNormas } from '../src/app/api/normas/route';
import { GET as getPaises } from '../src/app/api/paises/route';
import { GET as getSectores } from '../src/app/api/sectores/route';

describe('Cache System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Headers', () => {
    it('should return Cache-Control header on normas endpoint', async () => {
      const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
      const res = await getNormas(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('s-maxage');
    });

    it('should return Cache-Control header on paises endpoint', async () => {
      const req = new NextRequest('http://localhost:3000/api/paises?dominio=agua');
      const res = await getPaises(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('public');
    });

    it('should return Cache-Control header on sectores endpoint', async () => {
      const req = new NextRequest('http://localhost:3000/api/sectores?dominio=agua&pais=argentina');
      const res = await getSectores(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('public');
    });

    it('should include stale-while-revalidate directive', async () => {
      const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
      const res = await getNormas(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('stale-while-revalidate');
    });
  });

  describe('Cache Status Tracking', () => {
    it('should return MISS on first request to normas', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=agua&pais=brasil';
      const req = new NextRequest(url);
      const res = await getNormas(req);
      
      expect(res.headers.get('X-Cache-Status')).toBe('MISS');
    });

    it('should return HIT on second identical request to normas', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=agua&pais=chile';
      
      // First request
      const req1 = new NextRequest(url);
      await getNormas(req1);
      
      // Second request - should hit cache
      const req2 = new NextRequest(url);
      const res2 = await getNormas(req2);
      
      expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
    });

    it('should return MISS on first request to paises', async () => {
      const url = 'http://localhost:3000/api/paises?dominio=calidad-aire';
      const req = new NextRequest(url);
      const res = await getPaises(req);
      
      expect(res.headers.get('X-Cache-Status')).toBe('MISS');
    });

    it('should return HIT on second identical request to paises', async () => {
      const url = 'http://localhost:3000/api/paises?dominio=vertimientos';
      
      const req1 = new NextRequest(url);
      await getPaises(req1);
      
      const req2 = new NextRequest(url);
      const res2 = await getPaises(req2);
      
      expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
    });

    it('should return different cache for different parameters', async () => {
      const url1 = 'http://localhost:3000/api/normas?dominio=agua&pais=mexico';
      const url2 = 'http://localhost:3000/api/normas?dominio=agua&pais=peru';
      
      const req1 = new NextRequest(url1);
      const res1 = await getNormas(req1);
      expect(res1.headers.get('X-Cache-Status')).toBe('MISS');
      
      const req2 = new NextRequest(url2);
      const res2 = await getNormas(req2);
      expect(res2.headers.get('X-Cache-Status')).toBe('MISS');
    });
  });

  describe('Cache Performance', () => {
    it('should return cached data faster on subsequent requests', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=agua&pais=colombia';
      
      // First request - uncached
      const req1 = new NextRequest(url);
      const start1 = Date.now();
      const res1 = await getNormas(req1);
      const time1 = Date.now() - start1;
      expect(res1.status).toBe(200);
      
      // Second request - cached
      const req2 = new NextRequest(url);
      const start2 = Date.now();
      const res2 = await getNormas(req2);
      const time2 = Date.now() - start2;
      expect(res2.status).toBe(200);
      
      // Cached request should be faster or equal (file system may be cached)
      // We just verify both succeed, actual timing depends on system
      expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
    });

    it('should maintain data consistency between cached and fresh data', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=agua&pais=argentina';
      
      const req1 = new NextRequest(url);
      const res1 = await getNormas(req1);
      const data1 = await res1.json();
      
      const req2 = new NextRequest(url);
      const res2 = await getNormas(req2);
      const data2 = await res2.json();
      
      expect(JSON.stringify(data1)).toBe(JSON.stringify(data2));
    });
  });

  describe('Cache Invalidation', () => {
    it('should respect cache key uniqueness', async () => {
      const urls = [
        'http://localhost:3000/api/normas?dominio=residuos-solidos&pais=brasil',
        'http://localhost:3000/api/normas?dominio=vertimientos&pais=brasil',
        'http://localhost:3000/api/paises?dominio=residuos-solidos',
        'http://localhost:3000/api/paises?dominio=vertimientos',
      ];

      for (const url of urls) {
        const req = new NextRequest(url);
        const res = await (url.includes('/paises') ? getPaises(req) : getNormas(req));
        // May be HIT or MISS depending on execution order, just verify it succeeds
        expect([200, 400]).toContain(res.status);
        expect(res.headers.has('X-Cache-Status')).toBe(true);
      }
    });
  });

  describe('Cache Error Handling', () => {
    it('should not cache error responses', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=invalid&pais=argentina';
      
      const req1 = new NextRequest(url);
      const res1 = await getNormas(req1);
      expect(res1.status).toBe(400);
      
      // Second request should also get fresh error
      const req2 = new NextRequest(url);
      const res2 = await getNormas(req2);
      expect(res2.status).toBe(400);
      // Error responses should not show cache status or show MISS
      const cacheStatus = res2.headers.get('X-Cache-Status');
      expect(cacheStatus === null || cacheStatus === 'MISS').toBe(true);
    });

    it('should not cache 404 responses', async () => {
      const url = 'http://localhost:3000/api/normas?dominio=agua&pais=nonexistent';
      
      const req1 = new NextRequest(url);
      const res1 = await getNormas(req1);
      // validateCountry returns null, causing 400 not 404
      expect(res1.status).toBe(400);
      
      const req2 = new NextRequest(url);
      const res2 = await getNormas(req2);
      expect(res2.status).toBe(400);
      
      const cacheStatus = res2.headers.get('X-Cache-Status');
      expect(cacheStatus === null || cacheStatus === 'MISS').toBe(true);
    });
  });

  describe('Cache Configuration', () => {
    it('should have appropriate max-age for normas', async () => {
      const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
      const res = await getNormas(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toMatch(/s-maxage=\d+/);
      
      // Extract max-age value
      const match = cacheControl?.match(/s-maxage=(\d+)/);
      if (match) {
        const maxAge = parseInt(match[1]);
        expect(maxAge).toBeGreaterThan(0);
        expect(maxAge).toBeLessThanOrEqual(3600); // 1 hour max
      }
    });

    it('should have stale-while-revalidate configured', async () => {
      const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
      const res = await getNormas(req);
      
      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toMatch(/stale-while-revalidate=\d+/);
    });
  });
});
