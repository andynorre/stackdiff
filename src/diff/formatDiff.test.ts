import { describe, it, expect } from 'vitest';
import { formatDiff } from './formatDiff';
import type { DiffResult } from './diffEngine';

const sampleResult: DiffResult = {
  onlyInA: ['REMOVED_KEY'],
  onlyInB: ['ADDED_KEY'],
  changed: [{ key: 'DB_URL', valueA: 'localhost', valueB: 'prod-host' }],
  identical: ['PORT', 'NODE_ENV'],
};

describe('formatDiff text', () => {
  it('includes both labels in header', () => {
    const out = formatDiff(sampleResult, '.env', '.env.prod');
    expect(out).toContain('.env');
    expect(out).toContain('.env.prod');
  });

  it('lists keys only in A with minus prefix', () => {
    const out = formatDiff(sampleResult, 'A', 'B');
    expect(out).toContain('- REMOVED_KEY');
  });

  it('lists keys only in B with plus prefix', () => {
    const out = formatDiff(sampleResult, 'A', 'B');
    expect(out).toContain('+ ADDED_KEY');
  });

  it('shows changed key with both values', () => {
    const out = formatDiff(sampleResult, 'A', 'B');
    expect(out).toContain('~ DB_URL');
    expect(out).toContain('localhost');
    expect(out).toContain('prod-host');
  });

  it('shows identical key count', () => {
    const out = formatDiff(sampleResult, 'A', 'B');
    expect(out).toContain('Identical keys: 2');
  });
});

describe('formatDiff json', () => {
  it('returns valid JSON', () => {
    const out = formatDiff(sampleResult, 'A', 'B', 'json');
    const parsed = JSON.parse(out);
    expect(parsed.labelA).toBe('A');
    expect(parsed.onlyInA).toEqual(['REMOVED_KEY']);
  });
});
