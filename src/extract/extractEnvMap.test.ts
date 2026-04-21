import { describe, it, expect } from 'vitest';
import {
  extractEnvMap,
  extractMultipleEnvMaps,
  hasExtractMatches,
} from './extractEnvMap';

const sampleEnv: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost/db',
  DATABASE_POOL: '5',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  APP_SECRET: 'abc123',
  PORT: '3000',
};

describe('extractEnvMap', () => {
  it('extracts keys by explicit list', () => {
    const result = extractEnvMap('test', sampleEnv, { keys: ['PORT', 'REDIS_HOST'] });
    expect(result.extracted).toEqual({ PORT: '3000', REDIS_HOST: 'localhost' });
    expect(result.matched).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('extracts keys by regex pattern', () => {
    const result = extractEnvMap('test', sampleEnv, { pattern: /^DATABASE_/ });
    expect(result.extracted).toEqual({
      DATABASE_URL: 'postgres://localhost/db',
      DATABASE_POOL: '5',
    });
    expect(result.total).toBe(2);
  });

  it('combines key list and pattern', () => {
    const result = extractEnvMap('test', sampleEnv, {
      keys: ['PORT'],
      pattern: /^REDIS_/,
    });
    expect(Object.keys(result.extracted)).toContain('PORT');
    expect(Object.keys(result.extracted)).toContain('REDIS_HOST');
    expect(Object.keys(result.extracted)).toContain('REDIS_PORT');
    expect(result.total).toBe(3);
  });

  it('returns empty result when no matches', () => {
    const result = extractEnvMap('test', sampleEnv, { keys: ['NONEXISTENT'] });
    expect(result.extracted).toEqual({});
    expect(result.total).toBe(0);
  });

  it('respects ignoreCase option for key list', () => {
    const result = extractEnvMap('test', sampleEnv, {
      keys: ['port'],
      ignoreCase: true,
    });
    expect(result.extracted).toHaveProperty('PORT', '3000');
  });

  it('sets source correctly', () => {
    const result = extractEnvMap('.env.production', sampleEnv, { keys: ['PORT'] });
    expect(result.source).toBe('.env.production');
  });
});

describe('extractMultipleEnvMaps', () => {
  it('extracts from multiple env maps', () => {
    const maps = {
      production: sampleEnv,
      staging: { PORT: '4000', APP_SECRET: 'xyz' },
    };
    const results = extractMultipleEnvMaps(maps, { keys: ['PORT'] });
    expect(results).toHaveLength(2);
    expect(results[0].extracted).toHaveProperty('PORT');
    expect(results[1].extracted).toHaveProperty('PORT', '4000');
  });
});

describe('hasExtractMatches', () => {
  it('returns true when matches exist', () => {
    const result = extractEnvMap('test', sampleEnv, { keys: ['PORT'] });
    expect(hasExtractMatches(result)).toBe(true);
  });

  it('returns false when no matches', () => {
    const result = extractEnvMap('test', sampleEnv, { keys: [] });
    expect(hasExtractMatches(result)).toBe(false);
  });
});
