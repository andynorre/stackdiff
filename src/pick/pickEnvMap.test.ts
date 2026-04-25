import { describe, it, expect } from 'vitest';
import { pickEnvMap, pickMultipleEnvMaps, hasPickResults } from './pickEnvMap';

const sampleEnv = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET: 'shh',
};

describe('pickEnvMap', () => {
  it('picks only the specified keys', () => {
    const result = pickEnvMap(sampleEnv, ['API_KEY', 'DB_HOST']);
    expect(result.picked).toEqual({ API_KEY: 'abc123', DB_HOST: 'localhost' });
    expect(result.missing).toEqual([]);
    expect(result.total).toBe(2);
  });

  it('tracks missing keys', () => {
    const result = pickEnvMap(sampleEnv, ['API_KEY', 'MISSING_KEY']);
    expect(result.picked).toEqual({ API_KEY: 'abc123' });
    expect(result.missing).toEqual(['MISSING_KEY']);
    expect(result.total).toBe(1);
  });

  it('returns empty picked when no keys match', () => {
    const result = pickEnvMap(sampleEnv, ['NOPE', 'ALSO_NOPE']);
    expect(result.picked).toEqual({});
    expect(result.missing).toEqual(['NOPE', 'ALSO_NOPE']);
    expect(result.total).toBe(0);
  });

  it('handles empty keys array', () => {
    const result = pickEnvMap(sampleEnv, []);
    expect(result.picked).toEqual({});
    expect(result.missing).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe('pickMultipleEnvMaps', () => {
  it('picks keys from multiple sources', () => {
    const maps = {
      dev: { API_KEY: 'dev-key', DB_HOST: 'dev-host' },
      prod: { API_KEY: 'prod-key', DB_HOST: 'prod-host' },
    };
    const results = pickMultipleEnvMaps(maps, ['API_KEY']);
    expect(results.dev.picked).toEqual({ API_KEY: 'dev-key' });
    expect(results.prod.picked).toEqual({ API_KEY: 'prod-key' });
  });
});

describe('hasPickResults', () => {
  it('returns true when keys were picked', () => {
    const result = pickEnvMap(sampleEnv, ['API_KEY']);
    expect(hasPickResults(result)).toBe(true);
  });

  it('returns false when nothing was picked', () => {
    const result = pickEnvMap(sampleEnv, ['NOPE']);
    expect(hasPickResults(result)).toBe(false);
  });
});
