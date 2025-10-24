/**
 * SEO Tests
 * Tests for sitemap, robots.txt, and metadata configuration
 */

describe('SEO Configuration', () => {
  describe('Sitemap', () => {
    it('should generate sitemap with all domain/country combinations', async () => {
      const { default: sitemap } = await import('../src/app/sitemap');
      const urls = await sitemap();

      expect(Array.isArray(urls)).toBe(true);
      expect(urls.length).toBeGreaterThan(0);

      // Check structure of sitemap entries
      urls.forEach(entry => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');

        // Validate URL format
        expect(entry.url).toMatch(/^https?:\/\//);
        
        // Validate changeFrequency
        expect(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
          .toContain(entry.changeFrequency);
        
        // Validate priority range
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      });
    });

    it('should include homepage with highest priority', async () => {
      const { default: sitemap } = await import('../src/app/sitemap');
      const urls = await sitemap();

      const homepage = urls.find(entry => 
        entry.url.endsWith('/') || entry.url.endsWith('/explorar')
      );

      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBeGreaterThanOrEqual(0.8);
    });

    it('should include explorar pages for all combinations', async () => {
      const { default: sitemap } = await import('../src/app/sitemap');
      const urls = await sitemap();

      const domains = ['agua', 'calidad-aire', 'residuos-solidos', 'vertimientos'];
      const explorarUrls = urls.filter(entry => entry.url.includes('/explorar'));

      // Should have URLs for domain/country combinations
      expect(explorarUrls.length).toBeGreaterThan(domains.length);
      
      // Check that each domain is represented (using Spanish parameter 'dominio')
      domains.forEach(domain => {
        const domainUrls = explorarUrls.filter(entry => 
          entry.url.includes(`dominio=${domain}`)
        );
        expect(domainUrls.length).toBeGreaterThan(0);
      });
    });

    it('should have reasonable lastModified dates', async () => {
      const { default: sitemap } = await import('../src/app/sitemap');
      const urls = await sitemap();

      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      urls.forEach(entry => {
        if (entry.lastModified) {
          const lastModified = new Date(entry.lastModified);
          expect(lastModified.getTime()).toBeLessThanOrEqual(now.getTime());
          expect(lastModified.getTime()).toBeGreaterThanOrEqual(oneYearAgo.getTime());
        }
      });
    });
  });

  describe('Robots.txt', () => {
    it('should export robots configuration', async () => {
      const { default: robots } = await import('../src/app/robots');
      const config = robots();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('rules');
      expect(config).toHaveProperty('sitemap');
    });

    it('should allow general access', async () => {
      const { default: robots } = await import('../src/app/robots');
      const config = robots();

      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      expect(rules.length).toBeGreaterThan(0);
      
      const generalRule = rules.find((rule) => rule.userAgent === '*');
      expect(generalRule).toBeDefined();
      expect(generalRule?.allow).toBeDefined();
    });

    it('should block sensitive paths', async () => {
      const { default: robots } = await import('../src/app/robots');
      const config = robots();

      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      const generalRule = rules.find((rule) => rule.userAgent === '*');
      expect(generalRule?.disallow).toBeDefined();
      
      // Check that admin and api are blocked
      const disallowList = Array.isArray(generalRule?.disallow) 
        ? generalRule?.disallow 
        : [generalRule?.disallow];

      expect(disallowList).toContain('/admin/');
      expect(disallowList).toContain('/api/');
    });

    it('should reference sitemap', async () => {
      const { default: robots } = await import('../src/app/robots');
      const config = robots();

      expect(config.sitemap).toBeDefined();
      expect(typeof config.sitemap).toBe('string');
      expect(config.sitemap).toMatch(/sitemap\.xml$/);
    });
  });

  describe('Layout Metadata', () => {
    it('should export metadata configuration', async () => {
      const layout = await import('../src/app/layout');
      
      expect(layout.metadata).toBeDefined();
      expect(typeof layout.metadata).toBe('object');
    });

    it('should have comprehensive metadata', async () => {
      const { metadata } = await import('../src/app/layout');

      // Basic metadata
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toBeDefined();

      // Open Graph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();

      // Twitter
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.title).toBeDefined();
      expect(metadata.twitter?.description).toBeDefined();
    });

    it('should have SEO-friendly keywords', async () => {
      const { metadata } = await import('../src/app/layout');

      if (metadata.keywords) {
        const keywords = Array.isArray(metadata.keywords) 
          ? metadata.keywords 
          : [metadata.keywords];
        
        expect(keywords.length).toBeGreaterThan(5);

        // Check for important keywords
        const keywordsStr = keywords.join(' ').toLowerCase();
        expect(keywordsStr).toContain('normas');
        expect(keywordsStr).toContain('ambiental');
      }
    });

    it('should have proper locale configuration', async () => {
      const { metadata } = await import('../src/app/layout');

      expect(metadata.openGraph?.locale).toBe('es_ES');
      // alternates is optional metadata
      if (metadata.alternates) {
        expect(metadata.alternates).toBeDefined();
      }
    });
  });
});
