import { describe, it, expect } from 'vitest';
import { patchEnvMap, patchMultipleEnvMaps } from './patchEnvMap';
import { formatPatchResult, countPatchStats } from './formatPatch';

const base = { API_URL: 'http://localhost', DEBUG: 'false', OLD_KEY: 'value' };

describe('patchEnvMap', () => {
  it('applies a set operation', () => {
    const result = patchEnvMap(base, [{ op: 'set', key: 'NEW_KEY', value: '123' }]);
    expect(result.patched['NEW_KEY']).toBe('123');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies an unset operation', () => {
    const result = patchEnvMap(base, [{ op: 'unset', key: 'DEBUG' }]);
    expect(result.patched).not.toHaveProperty('DEBUG');
    expect(result.applied).toHaveLength(1);
  });

  it('skips unset for missing key', () => {
    const result = patchEnvMap(base, [{ op: 'unset', key: 'MISSING' }]);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toMatch(/does not exist/);
  });

  it('applies a rename operation', () => {
    const result = patchEnvMap(base, [{ op: 'rename', from: 'OLD_KEY', to: 'NEW_KEY' }]);
    expect(result.patched).not.toHaveProperty('OLD_KEY');
    expect(result.patched['NEW_KEY']).toBe('value');
    expect(result.applied).toHaveLength(1);
  });

  it('skips rename when source missing', () => {
    const result = patchEnvMap(base, [{ op: 'rename', from: 'GHOST', to: 'NEW' }]);
    expect(result.skipped[0].reason).toMatch(/does not exist/);
  });

  it('skips rename when target already exists', () => {
    const result = patchEnvMap(base, [{ op: 'rename', from: 'OLD_KEY', to: 'DEBUG' }]);
    expect(result.skipped[0].reason).toMatch(/already exists/);
  });

  it('does not mutate the original map', () => {
    const original = { ...base };
    patchEnvMap(base, [{ op: 'unset', key: 'DEBUG' }]);
    expect(base).toEqual(original);
  });
});

describe('patchMultipleEnvMaps', () => {
  it('applies operations to all maps', () => {
    const maps = { dev: { ...base }, prod: { ...base } };
    const results = patchMultipleEnvMaps(maps, [{ op: 'set', key: 'REGION', value: 'eu' }]);
    expect(results['dev'].patched['REGION']).toBe('eu');
    expect(results['prod'].patched['REGION']).toBe('eu');
  });
});

describe('formatPatchResult', () => {
  it('formats applied and skipped operations', () => {
    const result = patchEnvMap(base, [
      { op: 'set', key: 'X', value: '1' },
      { op: 'unset', key: 'MISSING' },
    ]);
    const output = formatPatchResult(result, 'test');
    expect(output).toContain('Applied');
    expect(output).toContain('Skipped');
    expect(output).toContain('SET X=1');
  });
});

describe('countPatchStats', () => {
  it('counts applied and skipped correctly', () => {
    const result = patchEnvMap(base, [
      { op: 'set', key: 'A', value: '1' },
      { op: 'unset', key: 'NOPE' },
    ]);
    const stats = countPatchStats(result);
    expect(stats.applied).toBe(1);
    expect(stats.skipped).toBe(1);
    expect(stats.total).toBe(2);
  });
});
