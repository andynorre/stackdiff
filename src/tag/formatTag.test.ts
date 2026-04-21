import { describe, it, expect } from 'vitest';
import {
  collectTagStats,
  formatTagResult,
  formatMultipleTagResults,
  countTaggedTotal,
  type TagResult,
} from './formatTag';

const makeResult = (overrides: Partial<TagResult> = {}): TagResult => ({
  source: 'test.env',
  original: { DB_HOST: 'localhost', API_KEY: 'secret', PORT: '3000' },
  tagged: { DB_HOST: 'localhost', API_KEY: 'secret', PORT: '3000' },
  tags: { API_KEY: ['secret', 'sensitive'], DB_HOST: ['database'] },
  ...overrides,
});

describe('collectTagStats', () => {
  it('returns correct total and tagged key counts', () => {
    const result = makeResult();
    const stats = collectTagStats(result);
    expect(stats.totalKeys).toBe(3);
    expect(stats.taggedKeys).toBe(2);
  });

  it('counts unique tags correctly', () => {
    const result = makeResult();
    const stats = collectTagStats(result);
    expect(stats.uniqueTags).toBe(3); // 'secret', 'sensitive', 'database'
  });

  it('returns zero counts for empty result', () => {
    const result = makeResult({ original: {}, tags: {} });
    const stats = collectTagStats(result);
    expect(stats.totalKeys).toBe(0);
    expect(stats.taggedKeys).toBe(0);
    expect(stats.uniqueTags).toBe(0);
  });
});

describe('formatTagResult', () => {
  it('includes source name in output', () => {
    const result = makeResult();
    expect(formatTagResult(result)).toContain('test.env');
  });

  it('includes tag summary line', () => {
    const result = makeResult();
    const output = formatTagResult(result);
    expect(output).toContain('Tagged 2/3 keys');
  });

  it('lists tagged keys and their tags', () => {
    const result = makeResult();
    const output = formatTagResult(result);
    expect(output).toContain('API_KEY');
    expect(output).toContain('secret');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('database');
  });

  it('handles no tagged keys gracefully', () => {
    const result = makeResult({ tags: {} });
    const output = formatTagResult(result);
    expect(output).toContain('Tagged 0/3 keys');
  });
});

describe('formatMultipleTagResults', () => {
  it('returns message for empty results', () => {
    expect(formatMultipleTagResults([])).toBe('No sources to tag.');
  });

  it('includes total summary at the end', () => {
    const results = [makeResult(), makeResult({ source: 'prod.env' })];
    const output = formatMultipleTagResults(results);
    expect(output).toContain('Total: 4 key(s) tagged across 2 source(s).');
  });
});

describe('countTaggedTotal', () => {
  it('sums tagged keys across all results', () => {
    const results = [makeResult(), makeResult()];
    expect(countTaggedTotal(results)).toBe(4);
  });

  it('returns 0 for empty array', () => {
    expect(countTaggedTotal([])).toBe(0);
  });
});
