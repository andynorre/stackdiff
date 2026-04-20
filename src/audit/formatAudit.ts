import { AuditLog, AuditEntry, AuditAction } from './auditLog';

const ACTION_SYMBOL: Record<AuditAction, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  unchanged: '=',
};

const ACTION_LABEL: Record<AuditAction, string> = {
  added: 'ADDED',
  removed: 'REMOVED',
  changed: 'CHANGED',
  unchanged: 'UNCHANGED',
};

function formatEntry(entry: AuditEntry): string {
  const sym = ACTION_SYMBOL[entry.action];
  const label = ACTION_LABEL[entry.action];
  if (entry.action === 'added') {
    return `  [${sym}] ${label}  ${entry.key} = "${entry.newValue}"`;
  }
  if (entry.action === 'removed') {
    return `  [${sym}] ${label}  ${entry.key} (was "${entry.oldValue}")`;
  }
  if (entry.action === 'changed') {
    return `  [${sym}] ${label} ${entry.key}\n       before: "${entry.oldValue}"\n       after:  "${entry.newValue}"`;
  }
  return `  [${sym}] ${label} ${entry.key}`;
}

export function formatAuditLog(log: AuditLog, includeUnchanged = false): string {
  const lines: string[] = [
    `Audit Log`,
    `Generated: ${log.createdAt}`,
    `Sources:   ${log.sources.join(' → ')}`,
    '',
  ];

  const entries = includeUnchanged
    ? log.entries
    : log.entries.filter((e) => e.action !== 'unchanged');

  if (entries.length === 0) {
    lines.push('  No changes detected.');
  } else {
    for (const entry of entries) {
      lines.push(formatEntry(entry));
    }
  }

  const summary = log.entries.reduce(
    (acc, e) => { acc[e.action] = (acc[e.action] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  lines.push('');
  lines.push(
    `Summary: +${summary.added ?? 0} added, -${summary.removed ?? 0} removed, ~${summary.changed ?? 0} changed, =${summary.unchanged ?? 0} unchanged`
  );

  return lines.join('\n');
}
