#!/usr/bin/env node

/**
 * URL Validation Script for Regulatory Sources
 * 
 * This script validates all URLs in REGULATORY_SOURCES by making HEAD requests
 * with retry logic and reports broken links, redirects, and updates timestamps.
 * 
 * Features:
 * - Retry logic with exponential backoff
 * - 10-second timeout per URL
 * - Follows redirects
 * - Rate limiting (500ms between requests)
 * - Detailed error reporting
 * 
 * Usage: npx tsx scripts/validate-regulatory-urls.ts
 */

import { REGULATORY_SOURCES } from '../src/lib/constants';

interface ValidationResult {
  url: string;
  country: string;
  domain: string;
  source: string;
  status: number;
  isValid: boolean;
  error?: string;
  redirect?: string;
}

const results: ValidationResult[] = [];

async function validateUrl(url: string, maxRetries = 2): Promise<{ status: number; redirect?: string; error?: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      return {
        status: response.status,
        redirect: response.url !== url ? response.url : undefined
      };
    } catch (error) {
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1s, 2s
        const backoffMs = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      return {
        status: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return {
    status: 0,
    error: 'Max retries exceeded'
  };
}

async function validateAllSources() {
  console.log('\n🔍 Validating Regulatory Source URLs...\n');

  let validated = 0;
  let errors = 0;

  for (const [country, domains] of Object.entries(REGULATORY_SOURCES)) {
    for (const [domain, sources] of Object.entries(domains)) {
      for (const source of sources) {
        process.stdout.write(`Validating ${country}/${domain}/${source.name}... `);
        
        const { status, redirect, error } = await validateUrl(source.url);
        const isValid = status >= 200 && status < 400;

        if (isValid) {
          console.log(`✅ ${status}`);
          validated++;
        } else {
          console.log(`❌ ${status || 'Error'}`);
          errors++;
        }

        results.push({
          url: source.url,
          country,
          domain,
          source: source.name,
          status,
          isValid,
          error,
          redirect
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Report results
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Validation Report`);
  console.log(`✅ Valid URLs: ${validated}`);
  console.log(`❌ Invalid URLs: ${errors}`);
  console.log(`📝 Total: ${results.length}\n`);

  if (errors > 0) {
    console.log('Invalid URLs:');
    results.filter(r => !r.isValid).forEach(r => {
      console.log(`  - ${r.country}/${r.domain}: ${r.source}`);
      console.log(`    URL: ${r.url}`);
      console.log(`    Status: ${r.status || 'Connection Error'}`);
      if (r.error) console.log(`    Error: ${r.error}`);
      if (r.redirect) console.log(`    Redirects to: ${r.redirect}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Last validated: ${new Date().toISOString()}\n`);
  
  // Exit with appropriate code
  process.exit(errors > 0 ? 1 : 0);
}

validateAllSources().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});
