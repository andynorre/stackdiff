import { describe, it, expect } from 'vitest';
import { sortEnvMap, sortMultipleEnvMaps, isSorted } from './sortEnvMap';

describe('sortEnvMap', () => {
  const env = { ZEBRA: 'z', APPLE: 'a', MANGO: 'm' };

  it('sorts keys in ascending order by default', () => {
    const result = sortEnvMap('test', env);
    expect(result.keys).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
    expect(Object.keys(result.sorted)).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys in descending order', () => {
    const result = sortEnvMap('test', env, { order: 'desc' });
    expect(result.keys).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('preserves original map unchanged', () => {
    const result = sortEnvMap('test', env);
    expect(Object.keys(result.original)).toEqual(['ZEBRA', 'APPLE', 'MANGO']);
  });

  it('preserves values after sorting', () => {
    const result = sortEnvMap('test', env);
    expect(result.sorted['APPLE']).toBe('a');
    expect(result.sorted['MANGO']).toBe('m');
    expect(result.sorted['ZEBRA']).toBe('z');
  });

  it('handles case-insensitive sorting by default', () => {
    const mixed = { b_KEY: '1', A_KEY: '2', c_KEY: '3' };
    const result = sortEnvMap('test', mixed);
    expect(result.keys).toEqual(['A_KEY', 'b_KEY', 'c_KEY']);
  });

  it('handles case-sensitive sorting when specified', () => {
    const mixed = { b_KEY: '1', A_KEY: '2' };
    const result = sortEnvMap('test', mixed, { caseSensitive: true });
    // uppercase letters come before lowercase in ASCII
    expect(result.keys[0]).toBe('A_KEY');
  });

  it('returns correct source name', () => {
    const result = sortEnvMap('production', env);
    expect(result.source).toBe('production');
  });
});

describe('sortMultipleEnvMaps', () => {
  it('sorts multiple env maps', () => {
    const maps = {
      dev: { Z: '1', A: '2' },
      prod: { M: '3', B: '4' },
    };
    const results = sortMultipleEnvMaps(maps);
    expect(results['dev'].keys).toEqual(['A', 'Z']);
    expect(results['prod'].keys).toEqual(['B', 'M']);
  });
});

describe('isSorted', () => {
  it('returns true for already sorted map', () => {
    const env = { ALPHA: '1', BETA: '2', GAMMA: '3' };
    expect(isSorted(env)).toBe(true);
  });

  it('returns false for unsorted map', () => {
    const env = { ZEBRA: '1', ALPHA: '2' };
    expect(isSorted(env)).toBe(false);
  });

  it('returns true for descending sorted map with desc option', () => {
    const env = { ZEBRA: '1', MANGO: '2', ALPHA: '3' };
    expect(isSorted(env, { order: 'desc' })).toBe(true);
  });

  it('returns true for single-key map', () => {
    expect(isSorted({ ONLY: 'one' })).toBe(true);
  });

  it('returns true for empty map', () => {
    expect(isSorted({})).toBe(true);
  });
});
