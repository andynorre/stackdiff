import { EnvMap } from '../parser/envParser';

export type AuditAction = 'added' | 'removed' | 'changed' | 'unchanged';

export interface AuditEntry {
  key: string;
  action: AuditAction;
  source: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface AuditLog {
  createdAt: string;
  sources: string[];
  entries: AuditEntry[];
}

export function buildAuditLog(
  before: EnvMap,
  after: EnvMap,
  sourceBefore: string,
  sourceAfter: string
): AuditLog {
  const timestamp = new Date().toISOString();
  const entries: AuditEntry[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const hadKey = key in before;
    const hasKey = key in after;

    if (!hadKey && hasKey) {
      entries.push({ key, action: 'added', source: sourceAfter, newValue: after[key], timestamp });
    } else if (hadKey && !hasKey) {
      entries.push({ key, action: 'removed', source: sourceBefore, oldValue: before[key], timestamp });
    } else if (before[key] !== after[key]) {
      entries.push({ key, action: 'changed', source: sourceAfter, oldValue: before[key], newValue: after[key], timestamp });
    } else {
      entries.push({ key, action: 'unchanged', source: sourceBefore, oldValue: before[key], newValue: after[key], timestamp });
    }
  }

  return {
    createdAt: timestamp,
    sources: [sourceBefore, sourceAfter],
    entries,
  };
}

export function filterAuditLog(log: AuditLog, actions: AuditAction[]): AuditLog {
  return {
    ...log,
    entries: log.entries.filter((e) => actions.includes(e.action)),
  };
}
