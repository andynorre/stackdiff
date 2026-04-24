import { describe, it, expect } from 'vitest';
import {
  sampleEnvMap,
  sampleMultipleEnvMaps,
  hasSampleResults,
} from './sampleEnvMap';

const env: Record<string, string> = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  REDIS_URL: 'redis://localhost',
  SECRET_KEY: 'abc123',
  LOG_LEVEL: 'info',
};

describe('sampleEnvMap', () => {
  it('samples first N keys by default', () => {
    const result = sampleEnvMap(env, { count: 3, strategy: 'first' });
    expect(result.selected).toBe(3);
    expect(Object.keys(result.sampled)).toEqual(['APP_NAME', 'APP_PORT', 'DB_HOST']);
    expect(result.strategy).toBe('first');
    expect(result.total).toBe(8);
  });

  it('samples last N keys', () => {
    const result = sampleEnvMap(env, { count: 2, strategy: 'last' });
    expect(result.selected).toBe(2);
    expect(Object.keys(result.sampled)).toEqual(['SECRET_KEY', 'LOG_LEVEL']);
  });

  it('samples every nth key', () => {
    const result = sampleEnvMap(env, { count: 4, strategy: 'nth', nth: 2 });
    expect(result.selected).toBe(4);
    expect(Object.keys(result.sampled)).toContain('APP_NAME');
    expect(Object.keys(result.sampled)).toContain('DB_HOST');
  });

  it('samples randomly with a seed', () => {
    const r1 = sampleEnvMap(env, { count: 3, strategy: 'random', seed: 99 });
    const r2 = sampleEnvMap(env, { count: 3, strategy: 'random', seed: 99 });
    expect(Object.keys(r1.sampled)).toEqual(Object.keys(r2.sampled));
  });

  it('clamps count to available keys', () => {
    const result = sampleEnvMap(env, { count: 100, strategy: 'first' });
    expect(result.selected).toBe(8);
  });

  it('returns empty sampled for empty env', () => {
    const result = sampleEnvMap({});
    expect(result.selected).toBe(0);
    expect(result.sampled).toEqual({});
  });
});

describe('sampleMultipleEnvMaps', () => {
  it('samples each env map independently', () => {
    const maps = { dev: env, prod: { API_URL: 'https://api.example.com', TIMEOUT: '30' } };
    const results = sampleMultipleEnvMaps(maps, { count: 2, strategy: 'first' });
    expect(results.dev.selected).toBe(2);
    expect(results.prod.selected).toBe(2);
  });
});

describe('hasSampleResults', () => {
  it('returns true when keys are selected', () => {
    const result = sampleEnvMap(env, { count: 1 });
    expect(hasSampleResults(result)).toBe(true);
  });

  it('returns false when nothing selected', () => {
    const result = sampleEnvMap({});
    expect(hasSampleResults(result)).toBe(false);
  });
});
