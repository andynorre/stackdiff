import { describe, it, expect } from 'vitest';
import { diffEnvMaps, hasDifferences } from './diffEngine';

describe('diffEnvMaps', () => {
  it('returns identical keys when maps are equal', () => {
    const a = { FOO: 'bar', BAZ: 'qux' };
    const result = diffEnvMaps(a, a);
    expect(result.identical).toEqual(['BAZ', 'FOO']);
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
  });

  it('detects keys only in A', () => {
    const a = { FOO: 'bar', EXTRA: '1' };
    const b = { FOO: 'bar' };
    const result = diffEnvMaps(a, b);
    expect(result.onlyInA).toEqual(['EXTRA']);
  });

  it('detects keys only in B', () => {
    const a = { FOO: 'bar' };
    const b = { FOO: 'bar', EXTRA: '1' };
    const result = diffEnvMaps(a, b);
    expect(result.onlyInB).toEqual(['EXTRA']);
  });

  it('detects changed values', () => {
    const a = { FOO: 'old' };
    const b = { FOO: 'new' };
    const result = diffEnvMaps(a, b);
    expect(result.changed).toEqual([{ key: 'FOO', valueA: 'old', valueB: 'new' }]);
  });

  it('handles empty maps', () => {
    const result = diffEnvMaps({}, {});
    expect(result.identical).toHaveLength(0);
    expect(hasDifferences(result)).toBe(false);
  });
});

describe('hasDifferences', () => {
  it('returns false when no differences', () => {
    const result = diffEnvMaps({ A: '1' }, { A: '1' });
    expect(hasDifferences(result)).toBe(false);
  });

  it('returns true when there are differences', () => {
    const result = diffEnvMaps({ A: '1' }, { A: '2' });
    expect(hasDifferences(result)).toBe(true);
  });
});
