import { describe, it, expect } from 'vitest';
import {
  prefixEnvMap,
  prefixMultipleEnvMaps,
  hasPrefixChanges,
  stripPrefix,
} from './prefixEnvMap';

const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };

describe('prefixEnvMap', () => {
  it('prefixes all keys with default separator', () => {
    const { result, added } = prefixEnvMap(base, { prefix: 'APP' });
    expect(result).toEqual({
      APP_HOST: 'localhost',
      APP_PORT: '3000',
      APP_DEBUG: 'true',
    });
    expect(added).toHaveLength(3);
  });

  it('uses custom separator', () => {
    const { result } = prefixEnvMap(base, { prefix: 'APP', separator: '.' });
    expect(result['APP.HOST']).toBe('localhost');
  });

  it('skips keys that would conflict when overwrite is false', () => {
    const env = { HOST: 'localhost', APP_HOST: 'other' };
    const { skipped } = prefixEnvMap(env, { prefix: 'APP', overwrite: false });
    expect(skipped).toContain('HOST');
  });

  it('overwrites conflicting keys when overwrite is true', () => {
    const env = { HOST: 'localhost', APP_HOST: 'other' };
    const { result } = prefixEnvMap(env, { prefix: 'APP', overwrite: true });
    expect(result['APP_HOST']).toBe('localhost');
  });

  it('returns empty result for empty input', () => {
    const { result, added } = prefixEnvMap({}, { prefix: 'X' });
    expect(result).toEqual({});
    expect(added).toHaveLength(0);
  });
});

describe('prefixMultipleEnvMaps', () => {
  it('prefixes all maps', () => {
    const maps = { dev: base, prod: { API: 'https://api.example.com' } };
    const results = prefixMultipleEnvMaps(maps, { prefix: 'SVC' });
    expect(results.dev.result['SVC_HOST']).toBe('localhost');
    expect(results.prod.result['SVC_API']).toBe('https://api.example.com');
  });
});

describe('hasPrefixChanges', () => {
  it('returns true when keys were prefixed', () => {
    const result = prefixEnvMap(base, { prefix: 'APP' });
    expect(hasPrefixChanges(result)).toBe(true);
  });

  it('returns false when nothing was prefixed', () => {
    expect(hasPrefixChanges({ source: {}, result: {}, added: [], skipped: [] })).toBe(false);
  });
});

describe('stripPrefix', () => {
  it('removes prefix from matching keys', () => {
    const env = { APP_HOST: 'localhost', APP_PORT: '3000', OTHER: 'x' };
    const result = stripPrefix(env, 'APP');
    expect(result).toEqual({ HOST: 'localhost', PORT: '3000', OTHER: 'x' });
  });

  it('handles custom separator', () => {
    const env = { 'APP.HOST': 'localhost' };
    const result = stripPrefix(env, 'APP', '.');
    expect(result['HOST']).toBe('localhost');
  });
});
