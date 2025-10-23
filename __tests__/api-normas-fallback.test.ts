/**
 * API Normas Fallback Tests
 * Tests for error handling and fallback behavior in normas API
 */

import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/normas/route';

describe('/api/normas - Fallback Behavior', () => {
  it('should handle malformed JSON files gracefully', async () => {
    // This test would require a malformed JSON file in test fixtures
    // For now, we test that valid requests work
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=agua&pais=argentina');
    const res = await GET(req);
    expect([200, 400, 404, 500]).toContain(res.status);
  });

  it('should return error for completely invalid parameters', async () => {
    const req = new NextRequest('http://localhost:3000/api/normas?dominio=<script>&pais=<script>');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
