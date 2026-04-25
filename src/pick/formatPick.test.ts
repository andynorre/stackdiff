import { describe, it, expect } from 'vitest';
import {
  collectPickStats,
  formatPickResult,
  formatMultiplePickResults,
  countPickedTotal,
} from './formatPick';
import type { PickResult, MultiplePickResult } from './pickEnvMap';

const resultWithAll: PickResult = {
  picked: { API_KEY: 'abc', DB_HOST: 'localhost' },
  missing: [],
  total: 2,
};

const resultWithMissing: PickResult = {
  picked: { API_KEY: 'abc' },
  missing: ['DB_HOST', 'SECRET'],
  total: 1,
};

describe('collectPickStats', () => {
  it('returns correct stats when nothing is missing', () => {
    const stats = collectPickStats(resultWithAll);
    expect(stats.picked).toBe(2);
    expect(stats.missing).toBe(0);
  });

  it('returns correct stats when keys are missing', () => {
    const stats = collectPickStats(resultWithMissing);
    expect(stats.picked).toBe(1);
    expect(stats.missing).toBe(2);
  });
});

describe('formatPickResult', () => {
  it('includes source name and picked keys', () => {
    const output = formatPickResult('dev', resultWithAll);
    expect(output).toContain('[dev]');
    expect(output).toContain('API_KEY=abc');
    expect(output).toContain('DB_HOST=localhost');
  });

  it('includes missing keys when present', () => {
    const output = formatPickResult('prod', resultWithMissing);
    expect(output).toContain('Missing keys: DB_HOST, SECRET');
  });

  it('does not mention missing keys when none are absent', () => {
    const output = formatPickResult('dev', resultWithAll);
    expect(output).not.toContain('Missing keys');
  });
});

describe('formatMultiplePickResults', () => {
  it('formats all sources', () => {
    const results: MultiplePickResult = {
      dev: resultWithAll,
      prod: resultWithMissing,
    };
    const output = formatMultiplePickResults(results);
    expect(output).toContain('[dev]');
    expect(output).toContain('[prod]');
  });
});

describe('countPickedTotal', () => {
  it('sums picked counts across all sources', () => {
    const results: MultiplePickResult = {
      dev: resultWithAll,
      prod: resultWithMissing,
    };
    expect(countPickedTotal(results)).toBe(3);
  });
});
