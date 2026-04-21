import { describe, it, expect } from 'vitest';
import { classifyEnvMap } from './classifyEnvMap';
import {
  formatCategorySection,
  formatClassifyResult,
  countCategoryStats,
  formatMultipleClassifyResults,
} from './formatClassify';

describe('formatCategorySection', () => {
  it('formats a section with keys', () => {
    const result = formatCategorySection('database', ['DB_HOST', 'DB_PORT']);
    expect(result).toContain('[Database]');
    expect(result).toContain('- DB_HOST');
    expect(result).toContain('- DB_PORT');
  });

  it('returns empty string for empty keys', () => {
    expect(formatCategorySection('cache', [])).toBe('');
  });
});

describe('formatClassifyResult', () => {
  it('includes header with name and total count', () => {
    const env = { DB_HOST: 'localhost', PORT: '3000' };
    const classified = classifyEnvMap(env);
    const result = formatClassifyResult(classified, 'production');
    expect(result).toContain('Classification: production (2 keys)');
  });

  it('includes category sections for present categories', () => {
    const env = { DB_HOST: 'localhost', JWT_SECRET: 'secret' };
    const classified = classifyEnvMap(env);
    const result = formatClassifyResult(classified);
    expect(result).toContain('[Database]');
    expect(result).toContain('[Auth / Secrets]');
  });

  it('uses default name when not provided', () => {
    const classified = classifyEnvMap({ PORT: '8080' });
    const result = formatClassifyResult(classified);
    expect(result).toContain('Classification: env');
  });
});

describe('countCategoryStats', () => {
  it('returns counts per category', () => {
    const env = { DB_HOST: 'a', DB_PORT: 'b', PORT: '3000' };
    const classified = classifyEnvMap(env);
    const stats = countCategoryStats(classified);
    expect(stats['database']).toBe(2);
    expect(stats['network']).toBe(1);
  });
});

describe('formatMultipleClassifyResults', () => {
  it('separates multiple results with a divider', () => {
    const maps = {
      dev: classifyEnvMap({ DB_HOST: 'localhost' }),
      prod: classifyEnvMap({ S3_BUCKET: 'bucket' }),
    };
    const result = formatMultipleClassifyResults(maps);
    expect(result).toContain('Classification: dev');
    expect(result).toContain('Classification: prod');
    expect(result).toContain('========================================');
  });
});
