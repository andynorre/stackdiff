import { describe, it, expect } from 'vitest';
import {
  searchEnvMap,
  searchMultipleEnvMaps,
  hasSearchMatches,
} from './searchEnvMap';

const sampleEnv: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost:5432/mydb',
  API_KEY: 'secret-key-123',
  APP_PORT: '3000',
  REDIS_URL: 'redis://localhost:6379',
  LOG_LEVEL: 'debug',
};

describe('searchEnvMap', () => {
  it('matches keys case-insensitively by default', () => {
    const result = searchEnvMap(sampleEnv, 'url', 'test');
    expect(result.matches).toHaveLength(2);
    expect(result.matches.map(m => m.key)).toContain('DATABASE_URL');
    expect(result.matches.map(m => m.key)).toContain('REDIS_URL');
  });

  it('matches values when searchValues is true', () => {
    const result = searchEnvMap(sampleEnv, 'localhost', 'test', { searchValues: true, searchKeys: false });
    expect(result.matches).toHaveLength(2);
    expect(result.matches.every(m => m.matchedOn === 'value')).toBe(true);
  });

  it('marks matchedOn as both when key and value match', () => {
    const env = { URL: 'http://url.example.com' };
    const result = searchEnvMap(env, 'url', 'test');
    expect(result.matches[0].matchedOn).toBe('both');
  });

  it('respects caseSensitive option', () => {
    const result = searchEnvMap(sampleEnv, 'URL', 'test', { caseSensitive: true });
    expect(result.matches).toHaveLength(2);
    const resultLower = searchEnvMap(sampleEnv, 'url', 'test', { caseSensitive: true });
    expect(resultLower.matches).toHaveLength(0);
  });

  it('supports regex search', () => {
    const result = searchEnvMap(sampleEnv, '^APP_', 'test', { regex: true });
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].key).toBe('APP_PORT');
  });

  it('returns totalKeys count', () => {
    const result = searchEnvMap(sampleEnv, 'xyz', 'test');
    expect(result.totalKeys).toBe(5);
    expect(result.matches).toHaveLength(0);
  });

  it('returns source and query in result', () => {
    const result = searchEnvMap(sampleEnv, 'PORT', 'production');
    expect(result.source).toBe('production');
    expect(result.query).toBe('PORT');
  });
});

describe('searchMultipleEnvMaps', () => {
  it('searches across multiple env maps', () => {
    const maps = { dev: sampleEnv, prod: { DB_HOST: 'prod-db', API_KEY: 'prod-key' } };
    const results = searchMultipleEnvMaps(maps, 'API_KEY');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.matches.length > 0)).toBe(true);
  });
});

describe('hasSearchMatches', () => {
  it('returns true when matches exist', () => {
    const result = searchEnvMap(sampleEnv, 'PORT', 'test');
    expect(hasSearchMatches(result)).toBe(true);
  });

  it('returns false when no matches', () => {
    const result = searchEnvMap(sampleEnv, 'NONEXISTENT_KEY_XYZ', 'test');
    expect(hasSearchMatches(result)).toBe(false);
  });
});
