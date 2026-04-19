import { describe, it, expect } from 'vitest';
import { mergeEnvMaps, hasConflicts } from './mergeEnvMaps';

describe('mergeEnvMaps', () => {
  it('merges non-overlapping maps', () => {
    const result = mergeEnvMaps({
      base: { FOO: 'foo', BAR: 'bar' },
      extra: { BAZ: 'baz' },
    });
    expect(result.merged).toEqual({ FOO: 'foo', BAR: 'bar', BAZ: 'baz' });
    expect(result.conflicts).toEqual({});
  });

  it('later source overrides earlier for same key', () => {
    const result = mergeEnvMaps({
      base: { FOO: 'original' },
      override: { FOO: 'overridden' },
    });
    expect(result.merged.FOO).toBe('overridden');
  });

  it('tracks origins correctly', () => {
    const result = mergeEnvMaps({
      a: { X: '1' },
      b: { Y: '2' },
    });
    expect(result.origins['X']).toEqual(['a']);
    expect(result.origins['Y']).toEqual(['b']);
  });

  it('records conflicts when values differ', () => {
    const result = mergeEnvMaps({
      dev: { API_URL: 'http://localhost' },
      prod: { API_URL: 'https://example.com' },
    });
    expect(result.conflicts['API_URL']).toBeDefined();
    expect(result.conflicts['API_URL'].values).toContain('http://localhost');
    expect(result.conflicts['API_URL'].values).toContain('https://example.com');
  });

  it('does not record conflict when values are identical', () => {
    const result = mergeEnvMaps({
      a: { SHARED: 'same' },
      b: { SHARED: 'same' },
    });
    expect(result.conflicts).toEqual({});
  });

  it('hasConflicts returns false when no conflicts', () => {
    const result = mergeEnvMaps({ a: { A: '1' }, b: { B: '2' } });
    expect(hasConflicts(result)).toBe(false);
  });

  it('hasConflicts returns true when conflicts exist', () => {
    const result = mergeEnvMaps({
      a: { KEY: 'val1' },
      b: { KEY: 'val2' },
    });
    expect(hasConflicts(result)).toBe(true);
  });
});
