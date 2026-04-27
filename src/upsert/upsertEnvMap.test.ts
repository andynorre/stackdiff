import { describe, it, expect } from 'vitest';
import {
  upsertEnvMap,
  upsertMultipleEnvMaps,
  hasUpsertChanges,
} from './upsertEnvMap';
import {
  collectUpsertStats,
  formatUpsertResult,
  formatMultipleUpsertResults,
  countUpsertedTotal,
} from './formatUpsert';

describe('upsertEnvMap', () => {
  it('inserts a new key', () => {
    const result = upsertEnvMap({ FOO: 'bar' }, [{ key: 'NEW_KEY', value: '123' }]);
    expect(result.map.NEW_KEY).toBe('123');
    expect(result.inserted).toContain('NEW_KEY');
    expect(result.updated).toHaveLength(0);
  });

  it('updates an existing key', () => {
    const result = upsertEnvMap({ FOO: 'bar' }, [{ key: 'FOO', value: 'baz' }]);
    expect(result.map.FOO).toBe('baz');
    expect(result.updated).toContain('FOO');
    expect(result.inserted).toHaveLength(0);
  });

  it('handles mixed insert and update', () => {
    const result = upsertEnvMap(
      { FOO: 'bar', KEEP: 'same' },
      [{ key: 'FOO', value: 'new' }, { key: 'ADDED', value: 'yes' }]
    );
    expect(result.inserted).toEqual(['ADDED']);
    expect(result.updated).toEqual(['FOO']);
    expect(result.map.KEEP).toBe('same');
  });

  it('returns empty changes when no operations given', () => {
    const result = upsertEnvMap({ A: '1' }, []);
    expect(result.inserted).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
  });
});

describe('hasUpsertChanges', () => {
  it('returns true when there are insertions', () => {
    const result = upsertEnvMap({}, [{ key: 'X', value: '1' }]);
    expect(hasUpsertChanges(result)).toBe(true);
  });

  it('returns false when no operations', () => {
    const result = upsertEnvMap({ A: '1' }, []);
    expect(hasUpsertChanges(result)).toBe(false);
  });
});

describe('upsertMultipleEnvMaps', () => {
  it('applies operations to all maps', () => {
    const multi = upsertMultipleEnvMaps(
      { dev: { A: '1' }, prod: { A: '2', B: '3' } },
      [{ key: 'A', value: 'updated' }, { key: 'C', value: 'new' }]
    );
    expect(multi.results.dev.map.A).toBe('updated');
    expect(multi.results.prod.map.C).toBe('new');
    expect(multi.results.dev.inserted).toContain('C');
    expect(multi.results.prod.updated).toContain('A');
  });
});

describe('formatUpsert', () => {
  it('collectUpsertStats returns correct counts', () => {
    const result = upsertEnvMap({ X: '1' }, [
      { key: 'X', value: '2' },
      { key: 'Y', value: '3' },
    ]);
    const stats = collectUpsertStats(result);
    expect(stats.inserted).toBe(1);
    expect(stats.updated).toBe(1);
    expect(stats.total).toBe(2);
  });

  it('formatUpsertResult includes inserted and updated labels', () => {
    const result = upsertEnvMap({ FOO: 'a' }, [
      { key: 'FOO', value: 'b' },
      { key: 'BAR', value: 'c' },
    ]);
    const text = formatUpsertResult('test', result);
    expect(text).toContain('inserted');
    expect(text).toContain('updated');
    expect(text).toContain('[test]');
  });

  it('formatUpsertResult shows no changes when empty', () => {
    const result = upsertEnvMap({ A: '1' }, []);
    expect(formatUpsertResult('env', result)).toContain('no changes');
  });

  it('countUpsertedTotal sums across all maps', () => {
    const multi = upsertMultipleEnvMaps(
      { a: {}, b: {} },
      [{ key: 'K', value: 'v' }]
    );
    expect(countUpsertedTotal(multi)).toBe(2);
  });

  it('formatMultipleUpsertResults joins sections', () => {
    const multi = upsertMultipleEnvMaps(
      { dev: {}, prod: {} },
      [{ key: 'NEW', value: '1' }]
    );
    const text = formatMultipleUpsertResults(multi);
    expect(text).toContain('[dev]');
    expect(text).toContain('[prod]');
  });
});
