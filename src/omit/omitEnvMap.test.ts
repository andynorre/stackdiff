import { describe, it, expect } from 'vitest';
import { omitEnvMap, omitMultipleEnvMaps, hasOmitChanges } from './omitEnvMap';

const env = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_TOKEN: 'xyz',
};

describe('omitEnvMap', () => {
  it('omits specified keys', () => {
    const result = omitEnvMap(env, { keys: ['API_KEY', 'SECRET_TOKEN'] });
    expect(result.omitted).toEqual(['API_KEY', 'SECRET_TOKEN']);
    expect(result.result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('retains all keys when none match', () => {
    const result = omitEnvMap(env, { keys: ['NONEXISTENT'] });
    expect(result.omitted).toHaveLength(0);
    expect(result.retained).toHaveLength(4);
  });

  it('handles ignoreCase option', () => {
    const result = omitEnvMap(env, { keys: ['api_key'], ignoreCase: true });
    expect(result.omitted).toContain('API_KEY');
  });

  it('returns empty result for empty env', () => {
    const result = omitEnvMap({}, { keys: ['API_KEY'] });
    expect(result.omitted).toHaveLength(0);
    expect(result.retained).toHaveLength(0);
  });

  it('preserves source reference', () => {
    const result = omitEnvMap(env, { keys: ['DB_HOST'] });
    expect(result.source).toBe(env);
  });
});

describe('omitMultipleEnvMaps', () => {
  it('applies omit to each env map', () => {
    const maps = { dev: { ...env }, prod: { API_KEY: 'prod-key', REGION: 'us-east-1' } };
    const results = omitMultipleEnvMaps(maps, { keys: ['API_KEY'] });
    expect(results.dev.omitted).toContain('API_KEY');
    expect(results.prod.omitted).toContain('API_KEY');
    expect(results.prod.result).toEqual({ REGION: 'us-east-1' });
  });
});

describe('hasOmitChanges', () => {
  it('returns true when keys were omitted', () => {
    const result = omitEnvMap(env, { keys: ['API_KEY'] });
    expect(hasOmitChanges(result)).toBe(true);
  });

  it('returns false when no keys were omitted', () => {
    const result = omitEnvMap(env, { keys: ['MISSING'] });
    expect(hasOmitChanges(result)).toBe(false);
  });
});
