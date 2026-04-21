import { describe, it, expect } from 'vitest';
import {
  compareEnvMaps,
  hasCompareDifferences,
  summariseCompare,
} from './compareEnvMaps';

const left = { API_URL: 'https://left.example.com', DB_HOST: 'localhost', SECRET: 'abc' };
const right = { API_URL: 'https://right.example.com', DB_HOST: 'localhost', PORT: '3000' };

describe('compareEnvMaps', () => {
  it('identifies keys only in left', () => {
    const result = compareEnvMaps(left, right);
    expect(result.onlyInLeft).toEqual(['SECRET']);
  });

  it('identifies keys only in right', () => {
    const result = compareEnvMaps(left, right);
    expect(result.onlyInRight).toEqual(['PORT']);
  });

  it('identifies keys in both', () => {
    const result = compareEnvMaps(left, right);
    expect(result.inBoth).toEqual(['API_URL', 'DB_HOST']);
  });

  it('identifies differing values', () => {
    const result = compareEnvMaps(left, right);
    expect(result.differing).toEqual(['API_URL']);
  });

  it('identifies matching values', () => {
    const result = compareEnvMaps(left, right);
    expect(result.matching).toEqual(['DB_HOST']);
  });

  it('mode=left omits onlyInRight', () => {
    const result = compareEnvMaps(left, right, 'left');
    expect(result.onlyInRight).toEqual([]);
  });

  it('mode=right includes onlyInRight', () => {
    const result = compareEnvMaps(left, right, 'right');
    expect(result.onlyInRight).toEqual(['PORT']);
  });

  it('returns empty arrays for identical maps', () => {
    const result = compareEnvMaps(left, left);
    expect(result.onlyInLeft).toEqual([]);
    expect(result.onlyInRight).toEqual([]);
    expect(result.differing).toEqual([]);
  });
});

describe('hasCompareDifferences', () => {
  it('returns true when differences exist', () => {
    const result = compareEnvMaps(left, right);
    expect(hasCompareDifferences(result)).toBe(true);
  });

  it('returns false for identical maps', () => {
    const result = compareEnvMaps(left, left);
    expect(hasCompareDifferences(result)).toBe(false);
  });
});

describe('summariseCompare', () => {
  it('returns a formatted summary string', () => {
    const result = compareEnvMaps(left, right);
    const summary = summariseCompare(result);
    expect(summary).toContain('Matching keys   : 1');
    expect(summary).toContain('Differing values: 1');
    expect(summary).toContain('Only in left    : 1');
    expect(summary).toContain('Only in right   : 1');
  });
});
