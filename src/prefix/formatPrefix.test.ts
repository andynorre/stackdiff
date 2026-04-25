import { describe, it, expect } from 'vitest';
import {
  collectPrefixStats,
  formatPrefixResult,
  formatMultiplePrefixResults,
  countPrefixedTotal,
} from './formatPrefix';
import { prefixEnvMap } from './prefixEnvMap';

const base = { HOST: 'localhost', PORT: '3000' };

describe('collectPrefixStats', () => {
  it('returns correct counts', () => {
    const result = prefixEnvMap(base, { prefix: 'APP' });
    const stats = collectPrefixStats(result);
    expect(stats.total).toBe(2);
    expect(stats.added).toBe(2);
    expect(stats.skipped).toBe(0);
  });

  it('counts skipped keys', () => {
    const env = { HOST: 'localhost', APP_HOST: 'other' };
    const result = prefixEnvMap(env, { prefix: 'APP', overwrite: false });
    const stats = collectPrefixStats(result);
    expect(stats.skipped).toBe(1);
  });
});

describe('formatPrefixResult', () => {
  it('includes name and stats', () => {
    const result = prefixEnvMap(base, { prefix: 'APP' });
    const output = formatPrefixResult('dev', result);
    expect(output).toContain('[dev]');
    expect(output).toContain('Prefixed');
    expect(output).toContain('2');
  });

  it('shows skipped keys when present', () => {
    const env = { HOST: 'localhost', APP_HOST: 'other' };
    const result = prefixEnvMap(env, { prefix: 'APP', overwrite: false });
    const output = formatPrefixResult('test', result);
    expect(output).toContain('conflict');
    expect(output).toContain('HOST');
  });
});

describe('formatMultiplePrefixResults', () => {
  it('formats all results separated by blank line', () => {
    const maps = { dev: base, prod: { API: 'url' } };
    const results: Record<string, ReturnType<typeof prefixEnvMap>> = {};
    for (const [k, v] of Object.entries(maps)) {
      results[k] = prefixEnvMap(v, { prefix: 'SVC' });
    }
    const output = formatMultiplePrefixResults(results);
    expect(output).toContain('[dev]');
    expect(output).toContain('[prod]');
  });
});

describe('countPrefixedTotal', () => {
  it('sums added keys across all results', () => {
    const maps = { a: { X: '1', Y: '2' }, b: { Z: '3' } };
    const results: Record<string, ReturnType<typeof prefixEnvMap>> = {};
    for (const [k, v] of Object.entries(maps)) {
      results[k] = prefixEnvMap(v, { prefix: 'P' });
    }
    expect(countPrefixedTotal(results)).toBe(3);
  });
});
