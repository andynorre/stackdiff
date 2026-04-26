import { describe, it, expect } from 'vitest';
import {
  lowercaseEnvMap,
  lowercaseMultipleEnvMaps,
  hasLowercaseChanges,
} from './lowercaseEnvMap';

describe('lowercaseEnvMap', () => {
  it('lowercases values while preserving keys', () => {
    const env = { API_URL: 'HTTPS://EXAMPLE.COM', NODE_ENV: 'PRODUCTION' };
    const result = lowercaseEnvMap('test', env);
    expect(result.lowercased).toEqual({
      API_URL: 'https://example.com',
      NODE_ENV: 'production',
    });
    expect(result.changedKeys).toContain('API_URL');
    expect(result.changedKeys).toContain('NODE_ENV');
  });

  it('does not mark already-lowercase values as changed', () => {
    const env = { API_URL: 'https://example.com', PORT: '3000' };
    const result = lowercaseEnvMap('test', env);
    expect(result.changedKeys).toHaveLength(0);
  });

  it('lowercases keys when lowercaseKeys option is true', () => {
    const env = { API_KEY: 'MySecret', DB_HOST: 'Localhost' };
    const result = lowercaseEnvMap('test', env, { lowercaseKeys: true });
    expect(result.lowercased).toHaveProperty('api_key', 'mysecret');
    expect(result.lowercased).toHaveProperty('db_host', 'localhost');
    expect(result.changedKeys).toContain('API_KEY');
    expect(result.changedKeys).toContain('DB_HOST');
  });

  it('handles empty env map', () => {
    const result = lowercaseEnvMap('empty', {});
    expect(result.lowercased).toEqual({});
    expect(result.changedKeys).toHaveLength(0);
  });

  it('preserves source name', () => {
    const result = lowercaseEnvMap('.env.production', { KEY: 'VALUE' });
    expect(result.source).toBe('.env.production');
  });
});

describe('lowercaseMultipleEnvMaps', () => {
  it('processes multiple env maps', () => {
    const envMaps = {
      dev: { HOST: 'LOCALHOST' },
      prod: { HOST: 'EXAMPLE.COM' },
    };
    const results = lowercaseMultipleEnvMaps(envMaps);
    expect(results).toHaveLength(2);
    expect(results[0].lowercased.HOST).toBe('localhost');
    expect(results[1].lowercased.HOST).toBe('example.com');
  });
});

describe('hasLowercaseChanges', () => {
  it('returns true when changes exist', () => {
    const result = lowercaseEnvMap('test', { KEY: 'VALUE' });
    expect(hasLowercaseChanges(result)).toBe(true);
  });

  it('returns false when no changes exist', () => {
    const result = lowercaseEnvMap('test', { key: 'value' });
    expect(hasLowercaseChanges(result)).toBe(false);
  });
});
