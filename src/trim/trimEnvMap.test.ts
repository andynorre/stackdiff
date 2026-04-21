import { describe, it, expect } from 'vitest';
import {
  trimEnvMap,
  trimMultipleEnvMaps,
  hasTrimChanges,
  stripSurroundingQuotes,
} from './trimEnvMap';
import { collectTrimStats, formatTrimResult } from './formatTrim';

describe('stripSurroundingQuotes', () => {
  it('strips double quotes', () => {
    expect(stripSurroundingQuotes('"hello"')).toBe('hello');
  });

  it('strips single quotes', () => {
    expect(stripSurroundingQuotes("'world'")).toBe('world');
  });

  it('strips backtick quotes', () => {
    expect(stripSurroundingQuotes('`value`')).toBe('value');
  });

  it('does not strip mismatched quotes', () => {
    expect(stripSurroundingQuotes('"mixed\'')).toBe('"mixed\'');
  });

  it('returns unchanged if no surrounding quotes', () => {
    expect(stripSurroundingQuotes('plain')).toBe('plain');
  });
});

describe('trimEnvMap', () => {
  it('trims leading and trailing whitespace from values by default', () => {
    const result = trimEnvMap({ KEY: '  value  ' });
    expect(result.KEY).toBe('value');
  });

  it('strips surrounding quotes from values by default', () => {
    const result = trimEnvMap({ KEY: '"quoted"' });
    expect(result.KEY).toBe('quoted');
  });

  it('trims keys when trimKeys is enabled', () => {
    const result = trimEnvMap({ '  KEY  ': 'val' }, { trimKeys: true });
    expect(result['KEY']).toBe('val');
  });

  it('does not strip quotes when stripQuotes is false', () => {
    const result = trimEnvMap({ KEY: '"quoted"' }, { stripQuotes: false });
    expect(result.KEY).toBe('"quoted"');
  });

  it('does not trim values when trimValues is false', () => {
    const result = trimEnvMap({ KEY: '  spaced  ' }, { trimValues: false });
    expect(result.KEY).toBe('  spaced  ');
  });
});

describe('trimMultipleEnvMaps', () => {
  it('trims all maps', () => {
    const maps = { dev: { A: '  1  ' }, prod: { B: '"2"' } };
    const result = trimMultipleEnvMaps(maps);
    expect(result.dev.A).toBe('1');
    expect(result.prod.B).toBe('2');
  });
});

describe('hasTrimChanges', () => {
  it('returns true when values differ', () => {
    expect(hasTrimChanges({ K: '  v  ' }, { K: 'v' })).toBe(true);
  });

  it('returns false when values are identical', () => {
    expect(hasTrimChanges({ K: 'v' }, { K: 'v' })).toBe(false);
  });
});

describe('collectTrimStats', () => {
  it('returns only changed keys', () => {
    const stats = collectTrimStats({ A: '  1  ', B: 'ok' }, { A: '1', B: 'ok' });
    expect(stats).toHaveLength(1);
    expect(stats[0].key).toBe('A');
    expect(stats[0].before).toBe('  1  ');
    expect(stats[0].after).toBe('1');
  });
});

describe('formatTrimResult', () => {
  it('reports no changes when maps are identical', () => {
    const out = formatTrimResult('test', []);
    expect(out).toContain('No changes');
  });

  it('lists modified keys', () => {
    const stats = [{ key: 'FOO', before: '  bar  ', after: 'bar' }];
    const out = formatTrimResult('env', stats, { trimValues: true });
    expect(out).toContain('FOO');
    expect(out).toContain('1 key(s) modified');
  });
});
