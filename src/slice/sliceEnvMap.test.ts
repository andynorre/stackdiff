import { describe, it, expect } from 'vitest';
import {
  sliceEnvMap,
  sliceMultipleEnvMaps,
  hasSliceResults,
} from './sliceEnvMap';

const sample: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'stackdiff',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
};

describe('sliceEnvMap', () => {
  it('keeps listed keys', () => {
    const result = sliceEnvMap('test', sample, { keys: ['DB_HOST', 'APP_NAME'] });
    expect(result.sliced).toEqual({ DB_HOST: 'localhost', APP_NAME: 'stackdiff' });
    expect(result.kept).toEqual(['DB_HOST', 'APP_NAME']);
    expect(result.dropped).toContain('SECRET_KEY');
  });

  it('keeps keys matching a prefix', () => {
    const result = sliceEnvMap('test', sample, { prefix: 'DB_' });
    expect(result.sliced).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.kept).toHaveLength(2);
  });

  it('strips the prefix when stripPrefix is true', () => {
    const result = sliceEnvMap('test', sample, { prefix: 'APP_', stripPrefix: true });
    expect(result.sliced).toHaveProperty('NAME', 'stackdiff');
    expect(result.sliced).toHaveProperty('ENV', 'production');
    expect(result.sliced).not.toHaveProperty('APP_NAME');
  });

  it('returns empty sliced map when no keys match', () => {
    const result = sliceEnvMap('test', sample, { prefix: 'MISSING_' });
    expect(result.sliced).toEqual({});
    expect(result.kept).toHaveLength(0);
    expect(result.dropped).toHaveLength(Object.keys(sample).length);
  });

  it('prefers keys over prefix when both provided', () => {
    const result = sliceEnvMap('test', sample, { keys: ['SECRET_KEY'], prefix: 'DB_' });
    expect(result.kept).toContain('SECRET_KEY');
    expect(result.kept).toContain('DB_HOST');
  });

  it('preserves source name in result', () => {
    const result = sliceEnvMap('.env.prod', sample, { keys: ['APP_NAME'] });
    expect(result.source).toBe('.env.prod');
  });
});

describe('sliceMultipleEnvMaps', () => {
  it('slices multiple env maps with the same options', () => {
    const maps = { dev: sample, prod: { DB_HOST: 'prod-db', OTHER: 'x' } };
    const results = sliceMultipleEnvMaps(maps, { prefix: 'DB_' });
    expect(results).toHaveLength(2);
    expect(results[0].sliced).toHaveProperty('DB_HOST');
    expect(results[1].sliced).toHaveProperty('DB_HOST', 'prod-db');
  });
});

describe('hasSliceResults', () => {
  it('returns true when keys were kept', () => {
    const result = sliceEnvMap('test', sample, { keys: ['APP_NAME'] });
    expect(hasSliceResults(result)).toBe(true);
  });

  it('returns false when no keys were kept', () => {
    const result = sliceEnvMap('test', sample, { prefix: 'NOPE_' });
    expect(hasSliceResults(result)).toBe(false);
  });
});
