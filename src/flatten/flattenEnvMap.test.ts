import { describe, it, expect } from 'vitest';
import {
  flattenEnvMap,
  expandEnvMap,
  hasNestedKeys,
  type EnvMap,
  type NestedEnvMap,
} from './flattenEnvMap';

describe('flattenEnvMap', () => {
  it('flattens a nested map with default separator', () => {
    const nested: NestedEnvMap = {
      DB: { HOST: 'localhost', PORT: '5432' },
      APP: { NAME: 'myapp' },
    };
    const result = flattenEnvMap(nested);
    expect(result).toEqual({
      DB__HOST: 'localhost',
      DB__PORT: '5432',
      APP__NAME: 'myapp',
    });
  });

  it('flattens with a custom separator', () => {
    const nested: NestedEnvMap = { DB: { HOST: 'localhost' } };
    const result = flattenEnvMap(nested, '_');
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('preserves top-level string values', () => {
    const nested: NestedEnvMap = { NODE_ENV: 'production', PORT: '3000' };
    const result = flattenEnvMap(nested);
    expect(result).toEqual({ NODE_ENV: 'production', PORT: '3000' });
  });

  it('handles empty nested map', () => {
    expect(flattenEnvMap({})).toEqual({});
  });
});

describe('expandEnvMap', () => {
  it('expands a flat map into nested structure', () => {
    const flat: EnvMap = { DB__HOST: 'localhost', DB__PORT: '5432' };
    const result = expandEnvMap(flat);
    expect(result).toEqual({ DB: { HOST: 'localhost', PORT: '5432' } });
  });

  it('expands with custom separator', () => {
    const flat: EnvMap = { DB_HOST: 'localhost' };
    const result = expandEnvMap(flat, '_');
    expect(result).toEqual({ DB: { HOST: 'localhost' } });
  });

  it('preserves keys without separator', () => {
    const flat: EnvMap = { NODE_ENV: 'test', PORT: '8080' };
    const result = expandEnvMap(flat);
    expect(result).toEqual({ NODE_ENV: 'test', PORT: '8080' });
  });

  it('handles empty flat map', () => {
    expect(expandEnvMap({})).toEqual({});
  });

  it('round-trips: flatten then expand returns equivalent structure', () => {
    const nested: NestedEnvMap = {
      DB: { HOST: 'localhost', PORT: '5432' },
      APP: { NAME: 'myapp' },
    };
    const flat = flattenEnvMap(nested);
    const expanded = expandEnvMap(flat);
    expect(expanded).toEqual(nested);
  });
});

describe('hasNestedKeys', () => {
  it('returns true when keys contain separator', () => {
    expect(hasNestedKeys({ DB__HOST: 'localhost' })).toBe(true);
  });

  it('returns false when no keys contain separator', () => {
    expect(hasNestedKeys({ NODE_ENV: 'test', PORT: '3000' })).toBe(false);
  });

  it('returns false for empty map', () => {
    expect(hasNestedKeys({})).toBe(false);
  });

  it('uses custom separator', () => {
    expect(hasNestedKeys({ DB_HOST: 'localhost' }, '_')).toBe(true);
    expect(hasNestedKeys({ DB_HOST: 'localhost' }, '__')).toBe(false);
  });
});
