import { describe, it, expect } from 'vitest';
import {
  collectOmitStats,
  formatOmitResult,
  formatMultipleOmitResults,
  countOmittedTotal,
} from './formatOmit';
import type { OmitResult } from './omitEnvMap';

const makeResult = (omitted: string[], retained: string[]): OmitResult => ({
  source: {},
  result: Object.fromEntries(retained.map((k) => [k, 'val'])),
  omitted,
  retained,
});

describe('collectOmitStats', () => {
  it('returns correct counts', () => {
    const stats = collectOmitStats(makeResult(['A', 'B'], ['C']));
    expect(stats).toEqual({ total: 3, omitted: 2, retained: 1 });
  });

  it('handles all retained', () => {
    const stats = collectOmitStats(makeResult([], ['X', 'Y']));
    expect(stats.omitted).toBe(0);
    expect(stats.retained).toBe(2);
  });
});

describe('formatOmitResult', () => {
  it('lists omitted keys', () => {
    const output = formatOmitResult('dev', makeResult(['API_KEY'], ['DB_HOST']));
    expect(output).toContain('[dev]');
    expect(output).toContain('- API_KEY');
    expect(output).toContain('Retained: 1 / 2');
  });

  it('shows no keys omitted message', () => {
    const output = formatOmitResult('prod', makeResult([], ['DB_HOST']));
    expect(output).toContain('No keys omitted.');
  });
});

describe('formatMultipleOmitResults', () => {
  it('formats all env maps', () => {
    const results = {
      dev: makeResult(['SECRET'], ['HOST']),
      prod: makeResult([], ['HOST', 'PORT']),
    };
    const output = formatMultipleOmitResults(results);
    expect(output).toContain('[dev]');
    expect(output).toContain('[prod]');
  });
});

describe('countOmittedTotal', () => {
  it('sums omitted across all results', () => {
    const results = {
      dev: makeResult(['A', 'B'], []),
      prod: makeResult(['C'], ['D']),
    };
    expect(countOmittedTotal(results)).toBe(3);
  });

  it('returns 0 when nothing omitted', () => {
    const results = { dev: makeResult([], ['X']) };
    expect(countOmittedTotal(results)).toBe(0);
  });
});
