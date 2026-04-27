import { describe, it, expect } from 'vitest';
import { collectReplaceStats, formatReplaceResult, formatMultipleReplaceResults, countReplacedTotal } from './formatReplace';
import { replaceEnvMap } from './replaceEnvMap';

const noChangeResult = replaceEnvMap({ KEY: 'value' }, { pattern: 'missing', replacement: 'x' });
const keyChangeResult = replaceEnvMap({ OLD_KEY: 'hello' }, { pattern: 'OLD', replacement: 'NEW', keysOnly: true });
const valueChangeResult = replaceEnvMap({ DB: 'localhost' }, { pattern: 'localhost', replacement: 'prod.db' });

describe('collectReplaceStats', () => {
  it('returns zeros when no changes', () => {
    const stats = collectReplaceStats(noChangeResult);
    expect(stats).toEqual({ keyChanges: 0, valueChanges: 0, totalChanges: 0 });
  });

  it('counts key changes', () => {
    const stats = collectReplaceStats(keyChangeResult);
    expect(stats.keyChanges).toBe(1);
    expect(stats.valueChanges).toBe(0);
  });

  it('counts value changes', () => {
    const stats = collectReplaceStats(valueChangeResult);
    expect(stats.valueChanges).toBe(1);
    expect(stats.keyChanges).toBe(0);
  });
});

describe('formatReplaceResult', () => {
  it('shows no replacements message when unchanged', () => {
    const output = formatReplaceResult('test', noChangeResult);
    expect(output).toContain('No replacements');
  });

  it('shows key change details', () => {
    const output = formatReplaceResult('env', keyChangeResult);
    expect(output).toContain('OLD_KEY');
    expect(output).toContain('NEW_KEY');
    expect(output).toContain('key:');
  });

  it('shows value change details', () => {
    const output = formatReplaceResult('env', valueChangeResult);
    expect(output).toContain('localhost');
    expect(output).toContain('prod.db');
    expect(output).toContain('value:');
  });
});

describe('formatMultipleReplaceResults', () => {
  it('formats results for multiple maps', () => {
    const output = formatMultipleReplaceResults({ dev: noChangeResult, prod: valueChangeResult });
    expect(output).toContain('[dev]');
    expect(output).toContain('[prod]');
  });
});

describe('countReplacedTotal', () => {
  it('sums changes across all results', () => {
    const total = countReplacedTotal({ a: noChangeResult, b: valueChangeResult, c: keyChangeResult });
    expect(total).toBe(2);
  });
});
