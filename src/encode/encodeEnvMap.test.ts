import { describe, it, expect } from 'vitest';
import {
  encodeValue,
  decodeValue,
  encodeEnvMap,
  encodeMultipleEnvMaps,
  hasEncodeChanges,
} from './encodeEnvMap';

describe('encodeValue', () => {
  it('encodes to base64', () => {
    expect(encodeValue('hello world', 'base64')).toBe('aGVsbG8gd29ybGQ=');
  });

  it('encodes to URI', () => {
    expect(encodeValue('hello world', 'uri')).toBe('hello%20world');
  });
});

describe('decodeValue', () => {
  it('decodes base64', () => {
    expect(decodeValue('aGVsbG8gd29ybGQ=', 'base64')).toBe('hello world');
  });

  it('decodes URI', () => {
    expect(decodeValue('hello%20world', 'uri')).toBe('hello world');
  });

  it('round-trips base64', () => {
    const original = 'my$ecret!Value#123';
    expect(decodeValue(encodeValue(original, 'base64'), 'base64')).toBe(original);
  });
});

describe('encodeEnvMap', () => {
  const env = { DB_PASS: 'p@ssw0rd!', HOST: 'localhost', EMPTY: '' };

  it('encodes all non-empty values by default', () => {
    const result = encodeEnvMap(env);
    expect(result.encoded['DB_PASS']).toBe(encodeValue('p@ssw0rd!', 'base64'));
    expect(result.encoded['HOST']).toBe(encodeValue('localhost', 'base64'));
    expect(result.encoded['EMPTY']).toBe('');
    expect(result.changedKeys).toContain('DB_PASS');
    expect(result.changedKeys).toContain('HOST');
    expect(result.changedKeys).not.toContain('EMPTY');
  });

  it('only encodes specified keys', () => {
    const result = encodeEnvMap(env, { keysOnly: ['DB_PASS'] });
    expect(result.changedKeys).toEqual(['DB_PASS']);
    expect(result.encoded['HOST']).toBe('localhost');
  });

  it('uses uri format when specified', () => {
    const result = encodeEnvMap({ KEY: 'a b' }, { format: 'uri' });
    expect(result.encoded['KEY']).toBe('a%20b');
    expect(result.format).toBe('uri');
  });

  it('preserves original map', () => {
    const result = encodeEnvMap(env);
    expect(result.original).toEqual(env);
  });
});

describe('encodeMultipleEnvMaps', () => {
  it('encodes multiple maps', () => {
    const maps = {
      dev: { SECRET: 'abc' },
      prod: { SECRET: 'xyz' },
    };
    const results = encodeMultipleEnvMaps(maps);
    expect(results['dev'].changedKeys).toContain('SECRET');
    expect(results['prod'].changedKeys).toContain('SECRET');
  });
});

describe('hasEncodeChanges', () => {
  it('returns true when keys were changed', () => {
    const result = encodeEnvMap({ A: 'value' });
    expect(hasEncodeChanges(result)).toBe(true);
  });

  it('returns false when nothing changed', () => {
    const result = encodeEnvMap({ A: '' });
    expect(hasEncodeChanges(result)).toBe(false);
  });
});
