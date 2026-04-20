import { describe, it, expect } from 'vitest';
import { buildAuditLog } from './auditLog';
import { formatAuditLog } from './formatAudit';

const before = { DB_HOST: 'localhost', SHARED: 'same' };
const after  = { DB_HOST: 'prod.db', SHARED: 'same', NEW_KEY: 'hello' };

describe('formatAuditLog', () => {
  it('includes header with sources and timestamp', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log);
    expect(output).toContain('Audit Log');
    expect(output).toContain('dev → prod');
  });

  it('shows added keys with + symbol', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log);
    expect(output).toContain('[+]');
    expect(output).toContain('NEW_KEY');
  });

  it('shows changed keys with ~ symbol', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log);
    expect(output).toContain('[~]');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('localhost');
    expect(output).toContain('prod.db');
  });

  it('excludes unchanged keys by default', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log);
    expect(output).not.toContain('UNCHANGED');
  });

  it('includes unchanged keys when flag is set', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log, true);
    expect(output).toContain('UNCHANGED');
    expect(output).toContain('SHARED');
  });

  it('includes summary line', () => {
    const log = buildAuditLog(before, after, 'dev', 'prod');
    const output = formatAuditLog(log);
    expect(output).toMatch(/Summary:.*added.*removed.*changed.*unchanged/);
  });

  it('shows no changes message when maps are identical', () => {
    const log = buildAuditLog({ A: '1' }, { A: '1' }, 'a', 'b');
    const output = formatAuditLog(log);
    expect(output).toContain('No changes detected.');
  });
});
