import { describe, it, expect } from 'vitest';
import {
  renameKeys,
  renameKeysInMultiple,
  hasRenameConflicts,
} from './renameKeys';

describe('renameKeys', () => {
  it('renames existing keys', () => {
    const env = { OLD_KEY: 'value', OTHER: 'other' };
    const result = renameKeys(env, { OLD_KEY: 'NEW_KEY' });
    expect(result.renamed).toEqual({ NEW_KEY: 'value', OTHER: 'other' });
    expect(result.applied).toEqual({ OLD_KEY: 'NEW_KEY' });
    expect(result.skipped).toEqual([]);
    expect(result.conflicts).toEqual([]);
  });

  it('skips keys not present in envMap', () => {
    const env = { EXISTING: 'val' };
    const result = renameKeys(env, { MISSING: 'NEW_KEY' });
    expect(result.skipped).toContain('MISSING');
    expect(result.renamed).toEqual({ EXISTING: 'val' });
  });

  it('flags conflicts when new key already exists', () => {
    const env = { OLD: 'a', NEW: 'b' };
    const result = renameKeys(env, { OLD: 'NEW' });
    expect(result.conflicts).toContain('NEW');
    expect(result.renamed).toEqual({ OLD: 'a', NEW: 'b' });
  });

  it('handles multiple renames at once', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = renameKeys(env, { A: 'X', B: 'Y' });
    expect(result.renamed).toEqual({ X: '1', Y: '2', C: '3' });
    expect(Object.keys(result.applied)).toHaveLength(2);
  });

  it('returns empty applied/skipped/conflicts for empty rename map', () => {
    const env = { KEY: 'val' };
    const result = renameKeys(env, {});
    expect(result.renamed).toEqual({ KEY: 'val' });
    expect(result.applied).toEqual({});
    expect(result.skipped).toEqual([]);
    expect(result.conflicts).toEqual([]);
  });
});

describe('renameKeysInMultiple', () => {
  it('applies rename map to all envMaps', () => {
    const maps = {
      dev: { OLD: 'dev_val' },
      prod: { OLD: 'prod_val' },
    };
    const results = renameKeysInMultiple(maps, { OLD: 'NEW' });
    expect(results.dev.renamed).toEqual({ NEW: 'dev_val' });
    expect(results.prod.renamed).toEqual({ NEW: 'prod_val' });
  });
});

describe('hasRenameConflicts', () => {
  it('returns true when conflicts exist', () => {
    const result = { renamed: {}, applied: {}, skipped: [], conflicts: ['KEY'] };
    expect(hasRenameConflicts(result)).toBe(true);
  });

  it('returns false when no conflicts', () => {
    const result = { renamed: {}, applied: {}, skipped: [], conflicts: [] };
    expect(hasRenameConflicts(result)).toBe(false);
  });
});
