import { describe, it, expect } from 'vitest';
import { buildAuditLog, filterAuditLog, AuditLog } from './auditLog';

const before = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc' };
const after  = { DB_HOST: 'prod.db', DB_PORT: '5432', API_KEY: 'xyz' };

describe('buildAuditLog', () => {
  it('detects added keys', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const added = log.entries.filter((e) => e.action === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('API_KEY');
    expect(added[0].newValue).toBe('xyz');
  });

  it('detects removed keys', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const removed = log.entries.filter((e) => e.action === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('SECRET');
    expect(removed[0].oldValue).toBe('abc');
  });

  it('detects changed keys', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const changed = log.entries.filter((e) => e.action === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('DB_HOST');
    expect(changed[0].oldValue).toBe('localhost');
    expect(changed[0].newValue).toBe('prod.db');
  });

  it('detects unchanged keys', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const unchanged = log.entries.filter((e) => e.action === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('DB_PORT');
  });

  it('sets correct sources and createdAt', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    expect(log.sources).toEqual(['dev', 'prod']);
    expect(log.createdAt).toBeTruthy();
  });
});

describe('filterAuditLog', () => {
  it('filters to only specified actions', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const filtered = filterAuditLog(log, ['added', 'removed']);
    expect(filtered.entries.every((e) => ['added', 'removed'].includes(e.action))).toBe(true);
    expect(filtered.entries).toHaveLength(2);
  });

  it('returns empty entries when no action matches', () => {
    const log = buildAuditLog({ A: '1' }, { A: '1' }, 'a', 'b');
    const filtered = filterAuditLog(log, ['added']);
    expect(filtered.entries).toHaveLength(0);
  });
});
