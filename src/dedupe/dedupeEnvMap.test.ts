import { describe, it, expect } from 'vitest';
import { dedupeEnvMap, findDuplicateKeys } from './dedupeEnvMap';

const mapA = { API_URL: 'https://a.example.com', PORT: '3000', DEBUG: 'true' };
const mapB = { API_URL: 'https://b.example.com', PORT: '4000', SECRET: 'abc' };
const mapC = { SECRET: 'xyz', TIMEOUT: '5000' };

describe('dedupeEnvMap', () => {
  it('merges non-overlapping maps without duplicates', () => {
    const result = dedupeEnvMap([{ A: '1' }, { B: '2' }]);
    expect(result.deduped).toEqual({ A: '1', B: '2' });
    expect(result.hadDuplicates).toBe(false);
    expect(result.duplicates).toEqual({});
  });

  it('uses first value by default when duplicates exist', () => {
    const result = dedupeEnvMap([mapA, mapB]);
    expect(result.deduped.API_URL).toBe('https://a.example.com');
    expect(result.deduped.PORT).toBe('3000');
    expect(result.hadDuplicates).toBe(true);
    expect(result.duplicates.API_URL).toEqual([
      'https://a.example.com',
      'https://b.example.com',
    ]);
  });

  it('uses last value when strategy is "last"', () => {
    const result = dedupeEnvMap([mapA, mapB], 'last');
    expect(result.deduped.API_URL).toBe('https://b.example.com');
    expect(result.deduped.PORT).toBe('4000');
  });

  it('throws on duplicates when strategy is "error"', () => {
    expect(() => dedupeEnvMap([mapA, mapB], 'error')).toThrow(
      /Duplicate key "API_URL"/
    );
  });

  it('handles three maps and tracks all duplicate values', () => {
    const result = dedupeEnvMap([mapB, mapC, { SECRET: 'override' }]);
    expect(result.duplicates.SECRET).toEqual(['abc', 'xyz', 'override']);
    expect(result.deduped.SECRET).toBe('abc');
  });

  it('returns empty result for empty input', () => {
    const result = dedupeEnvMap([]);
    expect(result.deduped).toEqual({});
    expect(result.hadDuplicates).toBe(false);
  });
});

describe('findDuplicateKeys', () => {
  it('returns keys that appear in more than one map', () => {
    const keys = findDuplicateKeys([mapA, mapB]);
    expect(keys).toContain('API_URL');
    expect(keys).toContain('PORT');
    expect(keys).not.toContain('DEBUG');
    expect(keys).not.toContain('SECRET');
  });

  it('returns empty array when no duplicates', () => {
    const keys = findDuplicateKeys([{ A: '1' }, { B: '2' }]);
    expect(keys).toEqual([]);
  });

  it('detects duplicates across three maps', () => {
    const keys = findDuplicateKeys([mapA, mapB, mapC]);
    expect(keys).toContain('SECRET');
  });
});
