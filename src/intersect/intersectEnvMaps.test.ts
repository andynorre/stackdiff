import { describe, it, expect } from 'vitest';
import { intersectEnvMaps, hasIntersection } from './intersectEnvMaps';

describe('intersectEnvMaps', () => {
  const mapA = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
  const mapB = { HOST: 'localhost', PORT: '4000', SECRET: 'abc' };
  const mapC = { HOST: 'localhost', PORT: '4000', EXTRA: 'x' };

  it('returns keys present in all maps (ignoring values)', () => {
    const result = intersectEnvMaps({ a: mapA, b: mapB });
    expect(Object.keys(result.keys)).toEqual(expect.arrayContaining(['HOST', 'PORT']));
    expect(Object.keys(result.keys)).not.toContain('DEBUG');
    expect(Object.keys(result.keys)).not.toContain('SECRET');
  });

  it('returns values from the first map', () => {
    const result = intersectEnvMaps({ a: mapA, b: mapB });
    expect(result.keys['PORT']).toBe('3000');
  });

  it('works across three maps', () => {
    const result = intersectEnvMaps({ a: mapA, b: mapB, c: mapC });
    expect(Object.keys(result.keys)).toEqual(['HOST']);
  });

  it('returns empty when no common keys', () => {
    const result = intersectEnvMaps({
      a: { FOO: '1' },
      b: { BAR: '2' },
    });
    expect(result.keys).toEqual({});
    expect(result.totalConsidered).toBe(1);
  });

  it('handles empty maps input', () => {
    const result = intersectEnvMaps({});
    expect(result.keys).toEqual({});
    expect(result.valueMismatches).toEqual([]);
  });

  it('matchValues: excludes keys with differing values', () => {
    const result = intersectEnvMaps({ a: mapA, b: mapB }, { matchValues: true });
    expect(Object.keys(result.keys)).toContain('HOST');
    expect(Object.keys(result.keys)).not.toContain('PORT');
    expect(result.valueMismatches).toContain('PORT');
  });

  it('matchValues: includes keys where all values match', () => {
    const result = intersectEnvMaps(
      { a: { X: 'same', Y: 'diff' }, b: { X: 'same', Y: 'other' } },
      { matchValues: true }
    );
    expect(result.keys).toEqual({ X: 'same' });
    expect(result.valueMismatches).toEqual(['Y']);
  });
});

describe('hasIntersection', () => {
  it('returns true when intersection is non-empty', () => {
    expect(hasIntersection({ keys: { A: '1' }, valueMismatches: [], totalConsidered: 1 })).toBe(true);
  });

  it('returns false when intersection is empty', () => {
    expect(hasIntersection({ keys: {}, valueMismatches: [], totalConsidered: 2 })).toBe(false);
  });
});
