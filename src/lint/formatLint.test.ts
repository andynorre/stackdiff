import { describe, it, expect } from 'vitest';
import { formatLintResult, formatMultipleLintResults, countLintStats } from './formatLint';
import type { LintResult } from './lintEnvMap';

const cleanResult: LintResult = {
  source: '.env',
  issues: [],
  errorCount: 0,
  warningCount: 0,
};

const dirtyResult: LintResult = {
  source: '.env.staging',
  issues: [
    { key: 'bad_key', rule: 'uppercase-key', severity: 'error', message: 'Key "bad_key" should be uppercase' },
    { key: 'EMPTY', rule: 'no-empty-value', severity: 'warning', message: 'Key "EMPTY" has an empty value' },
    { key: 'GOOD_KEY', rule: 'key-snake-case', severity: 'info', message: 'Key "GOOD_KEY" info' },
  ],
  errorCount: 1,
  warningCount: 1,
};

describe('formatLintResult', () => {
  it('shows no-issues message for clean result', () => {
    const output = formatLintResult(cleanResult);
    expect(output).toContain('No issues found');
    expect(output).toContain('.env');
  });

  it('includes severity icons and rule ids for issues', () => {
    const output = formatLintResult(dirtyResult);
    expect(output).toContain('✖');
    expect(output).toContain('⚠');
    expect(output).toContain('ℹ');
    expect(output).toContain('uppercase-key');
    expect(output).toContain('no-empty-value');
  });

  it('includes summary line with counts', () => {
    const output = formatLintResult(dirtyResult);
    expect(output).toContain('1 error(s)');
    expect(output).toContain('1 warning(s)');
  });
});

describe('formatMultipleLintResults', () => {
  it('includes results for all sources and a total line', () => {
    const output = formatMultipleLintResults({ '.env': cleanResult, '.env.staging': dirtyResult });
    expect(output).toContain('.env');
    expect(output).toContain('.env.staging');
    expect(output).toContain('Total:');
    expect(output).toContain('2 file(s)');
  });
});

describe('countLintStats', () => {
  it('returns counts per severity', () => {
    const stats = countLintStats(dirtyResult);
    expect(stats.error).toBe(1);
    expect(stats.warning).toBe(1);
    expect(stats.info).toBe(1);
  });

  it('returns zeros for clean result', () => {
    const stats = countLintStats(cleanResult);
    expect(stats.error).toBe(0);
    expect(stats.warning).toBe(0);
    expect(stats.info).toBe(0);
  });
});
