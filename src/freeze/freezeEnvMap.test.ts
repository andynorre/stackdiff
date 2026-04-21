import { describe, it, expect } from 'vitest';
import {
  freezeEnvMap,
  detectMutations,
  freezeMultipleEnvMaps,
} from './freezeEnvMap';

const base = { API_KEY: 'abc', DB_URL: 'postgres://localhost', PORT: '3000' };

describe('freezeEnvMap', () => {
  it('freezes all keys when no subset specified', () => {
    const result = freezeEnvMap(base);
    expect(result.frozen).toEqual(base);
    expect(result.frozenKeys).toEqual(expect.arrayContaining(['API_KEY', 'DB_URL', 'PORT']));
  });

  it('freezes only specified keys', () => {
    const result = freezeEnvMap(base, ['API_KEY', 'PORT']);
    expect(result.frozen).toEqual({ API_KEY: 'abc', PORT: '3000' });
    expect(result.frozenKeys).toHaveLength(2);
  });

  it('ignores keys not present in the env map', () => {
    const result = freezeEnvMap(base, ['API_KEY', 'MISSING_KEY']);
    expect(result.frozen).toEqual({ API_KEY: 'abc' });
    expect(result.frozenKeys).toEqual(['API_KEY']);
  });

  it('returns empty frozen map for empty input', () => {
    const result = freezeEnvMap({});
    expect(result.frozen).toEqual({});
    expect(result.frozenKeys).toHaveLength(0);
  });
});

describe('detectMutations', () => {
  it('reports no mutations when maps are identical', () => {
    const { frozen } = freezeEnvMap(base);
    const result = detectMutations(frozen, { ...base });
    expect(result.hasMutations).toBe(false);
    expect(result.mutated).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(3);
  });

  it('detects mutated values', () => {
    const { frozen } = freezeEnvMap(base);
    const current = { ...base, API_KEY: 'changed' };
    const result = detectMutations(frozen, current);
    expect(result.mutated).toContain('API_KEY');
    expect(result.hasMutations).toBe(true);
  });

  it('detects added keys', () => {
    const { frozen } = freezeEnvMap(base);
    const current = { ...base, NEW_KEY: 'new' };
    const result = detectMutations(frozen, current);
    expect(result.added).toContain('NEW_KEY');
    expect(result.hasMutations).toBe(true);
  });

  it('detects removed keys', () => {
    const { frozen } = freezeEnvMap(base);
    const { PORT: _removed, ...current } = base;
    const result = detectMutations(frozen, current);
    expect(result.removed).toContain('PORT');
    expect(result.hasMutations).toBe(true);
  });
});

describe('freezeMultipleEnvMaps', () => {
  it('freezes multiple labeled env maps', () => {
    const maps = { dev: base, prod: { API_KEY: 'xyz', DB_URL: 'postgres://prod' } };
    const results = freezeMultipleEnvMaps(maps, ['API_KEY']);
    expect(results['dev'].frozen).toEqual({ API_KEY: 'abc' });
    expect(results['prod'].frozen).toEqual({ API_KEY: 'xyz' });
  });
});
