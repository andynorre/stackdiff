import { describe, it, expect } from 'vitest';
import {
  collectSliceStats,
  formatSliceResult,
  formatMultipleSliceResults,
  countSlicedTotal,
} from './formatSlice';

const original = { A: '1', B: '2', C: '3', D: '4' };
const sliced = { A: '1', C: '3' };

describe('collectSliceStats', () => {
  it('returns correct counts', () => {
    const stats = collectSliceStats(original, sliced);
    expect(stats.totalKeys).toBe(4);
    expect(stats.includedKeys).toBe(2);
    expect(stats.excludedKeys).toBe(2);
    expect(stats.keys).toEqual(['A', 'C']);
  });

  it('handles empty sliced map', () => {
    const stats = collectSliceStats(original, {});
    expect(stats.includedKeys).toBe(0);
    expect(stats.excludedKeys).toBe(4);
  });
});

describe('formatSliceResult', () => {
  it('includes source name and stats', () => {
    const result = { source: '.env.prod', original, sliced, keys: ['A', 'C'] };
    const output = formatSliceResult(result);
    expect(output).toContain('.env.prod');
    expect(output).toContain('Total keys:    4');
    expect(output).toContain('Included keys: 2');
    expect(output).toContain('Excluded keys: 2');
    expect(output).toContain('A, C');
  });

  it('omits keys line when sliced is empty', () => {
    const result = { source: '.env', original, sliced: {}, keys: [] };
    const output = formatSliceResult(result);
    expect(output).not.toContain('Keys:');
  });
});

describe('formatMultipleSliceResults', () => {
  it('returns fallback message for empty array', () => {
    expect(formatMultipleSliceResults([])).toBe('No slice results.');
  });

  it('joins multiple results with blank line', () => {
    const r1 = { source: '.env.dev', original, sliced, keys: ['A', 'C'] };
    const r2 = { source: '.env.staging', original, sliced: { B: '2' }, keys: ['B'] };
    const output = formatMultipleSliceResults([r1, r2]);
    expect(output).toContain('.env.dev');
    expect(output).toContain('.env.staging');
  });
});

describe('countSlicedTotal', () => {
  it('sums all sliced keys across results', () => {
    const r1 = { source: 'a', original, sliced: { A: '1', B: '2' }, keys: [] };
    const r2 = { source: 'b', original, sliced: { C: '3' }, keys: [] };
    expect(countSlicedTotal([r1, r2])).toBe(3);
  });

  it('returns 0 for empty array', () => {
    expect(countSlicedTotal([])).toBe(0);
  });
});
