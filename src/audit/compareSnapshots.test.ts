import { describe, it, expect } from 'vitest';
import { compareSnapshots, summariseComparison } from '../snapshot/compareSnapshots';
import type { Snapshot } from '../snapshot/snapshotManager';

const makeSnapshot = (id: string, envMaps: Record<string, Record<string, string>>): Snapshot => ({
  id,
  createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  label: `snapshot-${id}`,
  envMaps,
});

describe('compareSnapshots', () => {
  it('returns no differences when snapshots are identical', () => {
    const snap = makeSnapshot('a', {
      production: { API_KEY: 'abc', DB_URL: 'postgres://localhost' },
    });
    const result = compareSnapshots(snap, snap);
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });

  it('detects added keys in the newer snapshot', () => {
    const older = makeSnapshot('a', { production: { API_KEY: 'abc' } });
    const newer = makeSnapshot('b', { production: { API_KEY: 'abc', NEW_KEY: 'value' } });
    const result = compareSnapshots(older, newer);
    expect(result.added).toHaveProperty('production');
    expect(result.added['production']).toContain('NEW_KEY');
  });

  it('detects removed keys in the newer snapshot', () => {
    const older = makeSnapshot('a', { production: { API_KEY: 'abc', OLD_KEY: 'gone' } });
    const newer = makeSnapshot('b', { production: { API_KEY: 'abc' } });
    const result = compareSnapshots(older, newer);
    expect(result.removed).toHaveProperty('production');
    expect(result.removed['production']).toContain('OLD_KEY');
  });

  it('detects changed values between snapshots', () => {
    const older = makeSnapshot('a', { production: { API_KEY: 'old-value' } });
    const newer = makeSnapshot('b', { production: { API_KEY: 'new-value' } });
    const result = compareSnapshots(older, newer);
    expect(result.changed).toHaveProperty('production');
    expect(result.changed['production']).toHaveProperty('API_KEY');
    expect(result.changed['production']['API_KEY']).toEqual({ from: 'old-value', to: 'new-value' });
  });

  it('handles new environments appearing in newer snapshot', () => {
    const older = makeSnapshot('a', { staging: { KEY: 'val' } });
    const newer = makeSnapshot('b', { staging: { KEY: 'val' }, production: { KEY: 'prod-val' } });
    const result = compareSnapshots(older, newer);
    expect(result.added).toHaveProperty('production');
    expect(result.added['production']).toContain('KEY');
  });

  it('handles environments removed in newer snapshot', () => {
    const older = makeSnapshot('a', { staging: { KEY: 'val' }, production: { KEY: 'prod' } });
    const newer = makeSnapshot('b', { staging: { KEY: 'val' } });
    const result = compareSnapshots(older, newer);
    expect(result.removed).toHaveProperty('production');
    expect(result.removed['production']).toContain('KEY');
  });
});

describe('summariseComparison', () => {
  it('returns a summary with zero counts when no differences', () => {
    const snap = makeSnapshot('a', { production: { KEY: 'value' } });
    const result = compareSnapshots(snap, snap);
    const summary = summariseComparison(result);
    expect(summary.totalAdded).toBe(0);
    expect(summary.totalRemoved).toBe(0);
    expect(summary.totalChanged).toBe(0);
    expect(summary.hasDifferences).toBe(false);
  });

  it('correctly counts differences across environments', () => {
    const older = makeSnapshot('a', {
      production: { A: '1', B: '2', C: '3' },
      staging: { X: 'x' },
    });
    const newer = makeSnapshot('b', {
      production: { A: '1', B: 'changed', D: 'new' },
      staging: { X: 'x', Y: 'added' },
    });
    const result = compareSnapshots(older, newer);
    const summary = summariseComparison(result);
    expect(summary.totalAdded).toBe(2);   // D in production, Y in staging
    expect(summary.totalRemoved).toBe(1); // C in production
    expect(summary.totalChanged).toBe(1); // B in production
    expect(summary.hasDifferences).toBe(true);
  });
});
