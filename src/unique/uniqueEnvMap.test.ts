import { describe, it, expect } from 'vitest';
import {
  uniqueEnvMap,
  uniqueMultipleEnvMaps,
  hasUniqueResults,
} from './uniqueEnvMap';

describe('uniqueEnvMap', () => {
  it('returns all entries when all values are unique', () => {
    const map = { A: 'alpha', B: 'beta', C: 'gamma' };
    const result = uniqueEnvMap(map);
    expect(result.entries).toEqual({ A: 'alpha', B: 'beta', C: 'gamma' });
    expect(result.duplicateKeysRemoved).toEqual([]);
  });

  it('removes entries whose value appears more than once', () => {
    const map = { A: 'same', B: 'same', C: 'unique' };
    const result = uniqueEnvMap(map);
    expect(result.entries).toEqual({ C: 'unique' });
    expect(result.duplicateKeysRemoved).toContain('A');
    expect(result.duplicateKeysRemoved).toContain('B');
  });

  it('returns empty entries when all values are duplicated', () => {
    const map = { X: 'dup', Y: 'dup' };
    const result = uniqueEnvMap(map);
    expect(result.entries).toEqual({});
    expect(result.duplicateKeysRemoved).toHaveLength(2);
  });

  it('handles an empty map', () => {
    const result = uniqueEnvMap({});
    expect(result.entries).toEqual({});
    expect(result.duplicateKeysRemoved).toEqual([]);
  });
});

describe('uniqueMultipleEnvMaps', () => {
  it('keeps values unique to a single map', () => {
    const maps = {
      dev: { API_URL: 'http://dev.local', SHARED: 'common' },
      prod: { API_URL: 'https://prod.example.com', SHARED: 'common' },
    };
    const results = uniqueMultipleEnvMaps(maps);
    expect(results.dev.entries).toEqual({ API_URL: 'http://dev.local' });
    expect(results.prod.entries).toEqual({ API_URL: 'https://prod.example.com' });
    expect(results.dev.duplicateKeysRemoved).toContain('SHARED');
    expect(results.prod.duplicateKeysRemoved).toContain('SHARED');
  });

  it('removes all entries when all values are shared across maps', () => {
    const maps = {
      a: { KEY: 'value' },
      b: { KEY2: 'value' },
    };
    const results = uniqueMultipleEnvMaps(maps);
    expect(results.a.entries).toEqual({});
    expect(results.b.entries).toEqual({});
  });

  it('handles a single map (all values are unique by definition)', () => {
    const maps = { only: { FOO: 'bar', BAZ: 'qux' } };
    const results = uniqueMultipleEnvMaps(maps);
    expect(results.only.entries).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(results.only.duplicateKeysRemoved).toEqual([]);
  });
});

describe('hasUniqueResults', () => {
  it('returns true when entries exist', () => {
    expect(hasUniqueResults({ source: 'x', entries: { A: '1' }, duplicateKeysRemoved: [] })).toBe(true);
  });

  it('returns false when entries are empty', () => {
    expect(hasUniqueResults({ source: 'x', entries: {}, duplicateKeysRemoved: ['A'] })).toBe(false);
  });
});
