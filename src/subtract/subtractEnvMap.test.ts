import { describe, it, expect } from 'vitest';
import {
  subtractEnvMap,
  subtractMultipleEnvMaps,
  hasSubtractChanges,
} from './subtractEnvMap';

describe('subtractEnvMap', () => {
  it('removes keys present in the subtrahend', () => {
    const base = { A: '1', B: '2', C: '3' };
    const subtrahend = { B: 'x', C: 'y' };
    const { result, removed, retained } = subtractEnvMap(base, subtrahend);
    expect(result).toEqual({ A: '1' });
    expect(removed).toEqual(['B', 'C']);
    expect(retained).toEqual(['A']);
  });

  it('returns all keys when subtrahend is empty', () => {
    const base = { A: '1', B: '2' };
    const { result, removed, retained } = subtractEnvMap(base, {});
    expect(result).toEqual(base);
    expect(removed).toHaveLength(0);
    expect(retained).toHaveLength(2);
  });

  it('returns empty result when all keys are subtracted', () => {
    const base = { A: '1', B: '2' };
    const subtrahend = { A: 'x', B: 'y' };
    const { result, removed } = subtractEnvMap(base, subtrahend);
    expect(result).toEqual({});
    expect(removed).toHaveLength(2);
  });

  it('ignores keys in subtrahend not present in base', () => {
    const base = { A: '1' };
    const subtrahend = { Z: 'z' };
    const { result, removed } = subtractEnvMap(base, subtrahend);
    expect(result).toEqual({ A: '1' });
    expect(removed).toHaveLength(0);
  });
});

describe('subtractMultipleEnvMaps', () => {
  it('applies subtraction to each source map', () => {
    const sources = {
      dev: { A: '1', B: '2' },
      prod: { A: '1', C: '3' },
    };
    const subtrahend = { A: 'x' };
    const results = subtractMultipleEnvMaps(sources, subtrahend);
    expect(results.dev.result).toEqual({ B: '2' });
    expect(results.prod.result).toEqual({ C: '3' });
  });
});

describe('hasSubtractChanges', () => {
  it('returns true when keys were removed', () => {
    expect(hasSubtractChanges({ result: {}, removed: ['A'], retained: [] })).toBe(true);
  });

  it('returns false when nothing was removed', () => {
    expect(hasSubtractChanges({ result: { A: '1' }, removed: [], retained: ['A'] })).toBe(false);
  });
});
