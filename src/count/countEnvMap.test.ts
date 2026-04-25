import { describe, it, expect } from 'vitest';
import { countEnvMap, countMultipleEnvMaps, hasCounts } from './countEnvMap';

describe('countEnvMap', () => {
  it('returns zeros for empty map', () => {
    const result = countEnvMap({});
    expect(result.total).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.nonEmpty).toBe(0);
    expect(result.byPrefix).toEqual({});
  });

  it('counts total, empty, and nonEmpty keys', () => {
    const result = countEnvMap({ FOO: 'bar', BAZ: '', QUX: 'hello' });
    expect(result.total).toBe(3);
    expect(result.empty).toBe(1);
    expect(result.nonEmpty).toBe(2);
  });

  it('groups keys by prefix', () => {
    const result = countEnvMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'prod' });
    expect(result.byPrefix['DB']).toBe(2);
    expect(result.byPrefix['APP']).toBe(1);
  });

  it('assigns keys without underscore to __none__', () => {
    const result = countEnvMap({ PORT: '3000', HOST: 'localhost' });
    expect(result.byPrefix['__none__']).toBe(2);
  });
});

describe('countMultipleEnvMaps', () => {
  it('aggregates counts across multiple sources', () => {
    const result = countMultipleEnvMaps({
      dev: { FOO: 'bar', BAZ: '' },
      prod: { FOO: 'baz', EXTRA: 'val' },
    });
    expect(result.sources['dev'].total).toBe(2);
    expect(result.sources['prod'].total).toBe(2);
    expect(result.totals.total).toBe(4);
    expect(result.totals.empty).toBe(1);
    expect(result.totals.nonEmpty).toBe(3);
  });

  it('merges byPrefix across sources', () => {
    const result = countMultipleEnvMaps({
      a: { DB_HOST: 'h1' },
      b: { DB_PORT: '5432' },
    });
    expect(result.totals.byPrefix['DB']).toBe(2);
  });
});

describe('hasCounts', () => {
  it('returns false for empty result', () => {
    expect(hasCounts({ total: 0, empty: 0, nonEmpty: 0, byPrefix: {} })).toBe(false);
  });

  it('returns true when total > 0', () => {
    expect(hasCounts({ total: 1, empty: 0, nonEmpty: 1, byPrefix: {} })).toBe(true);
  });
});
