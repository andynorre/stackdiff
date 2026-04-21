import { describe, it, expect } from 'vitest';
import { scopeEnvMap, scopeMultipleEnvMaps, listScopes } from './scopeEnvMap';

const sampleEnv: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
};

describe('scopeEnvMap', () => {
  it('returns only keys matching the given scope prefix', () => {
    const result = scopeEnvMap(sampleEnv, 'DB');
    expect(result.matched).toEqual({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'mydb',
    });
    expect(result.matchCount).toBe(3);
  });

  it('puts non-matching keys in excluded', () => {
    const result = scopeEnvMap(sampleEnv, 'DB');
    expect(result.excluded).not.toHaveProperty('DB_HOST');
    expect(result.excludedCount).toBe(4);
  });

  it('strips prefix when stripPrefix is true', () => {
    const result = scopeEnvMap(sampleEnv, 'DB', { stripPrefix: true });
    expect(result.matched).toHaveProperty('HOST', 'localhost');
    expect(result.matched).toHaveProperty('PORT', '5432');
    expect(result.matched).not.toHaveProperty('DB_HOST');
  });

  it('matches case-insensitively when caseInsensitive is true', () => {
    const env = { db_host: 'localhost', db_port: '5432', OTHER: 'val' };
    const result = scopeEnvMap(env, 'DB', { caseInsensitive: true });
    expect(result.matchCount).toBe(2);
  });

  it('returns empty matched when no keys match scope', () => {
    const result = scopeEnvMap(sampleEnv, 'UNKNOWN');
    expect(result.matched).toEqual({});
    expect(result.matchCount).toBe(0);
  });

  it('handles scope string already ending with underscore', () => {
    const result = scopeEnvMap(sampleEnv, 'REDIS_');
    expect(result.matchCount).toBe(2);
  });
});

describe('scopeMultipleEnvMaps', () => {
  it('applies scope to each named env map', () => {
    const maps = { prod: sampleEnv, staging: { DB_HOST: 'staging-db', APP_ENV: 'staging' } };
    const results = scopeMultipleEnvMaps(maps, 'DB');
    expect(results.prod.matchCount).toBe(3);
    expect(results.staging.matchCount).toBe(1);
  });
});

describe('listScopes', () => {
  it('returns unique sorted scope prefixes', () => {
    const scopes = listScopes(sampleEnv);
    expect(scopes).toEqual(['APP', 'DB', 'REDIS', 'SECRET']);
  });

  it('returns empty array for env with no underscored keys', () => {
    expect(listScopes({ FOO: 'bar', BAZ: 'qux' })).toEqual([]);
  });
});
