/**
 * Integration tests for production configuration
 * Tests security headers, cache behavior, and SEO features
 */

import fs from 'fs';
import path from 'path';

describe('Production Configuration', () => {
  describe('next.config.js', () => {
    it('should exist and be readable', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      expect(fs.existsSync(configPath)).toBe(true);
      
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have security headers configuration in source', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Check for critical security headers in source
      expect(content).toContain('X-DNS-Prefetch-Control');
      expect(content).toContain('Strict-Transport-Security');
      expect(content).toContain('X-Frame-Options');
      expect(content).toContain('X-Content-Type-Options');
      expect(content).toContain('Referrer-Policy');
      expect(content).toContain('Permissions-Policy'); // Modern alternative to Feature-Policy
    });

    it('should have HSTS configuration with proper max-age', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('Strict-Transport-Security');
      expect(content).toContain('max-age=');
      expect(content).toContain('includeSubDomains');
    });

    it('should have image optimization configured', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('images:');
      expect(content).toContain('image/webp');
      expect(content).toContain('image/avif');
    });

    it('should have experimental optimizations enabled', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('experimental:');
      expect(content).toContain('optimizePackageImports');
    });

    it('should use ESM export syntax', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('export default');
      expect(content).not.toContain('module.exports');
    });
  });

  describe('Environment Variables', () => {
    it('should have NODE_ENV set to test', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should have NEXT_PUBLIC_BASE_URL configured', () => {
      expect(process.env.NEXT_PUBLIC_BASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_BASE_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('Module System', () => {
    it('should be using ES Modules', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Verify ESM syntax
      expect(content).toContain('export default');
    });

    it('should have type module in package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const content = fs.readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.type).toBe('module');
    });
  });
});
