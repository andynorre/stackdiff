import { DiffResult } from '../diff/diffEngine';

export function formatMarkdownTable(label: string, diff: DiffResult): string {
  const rows: string[] = [
    `## ${label}`,
    '',
    '| Status | Key |',
    '|--------|-----|',
  ];

  for (const key of diff.added) {
    rows.push(`| ✅ Added | \`${key}\` |`);
  }
  for (const key of diff.removed) {
    rows.push(`| ❌ Removed | \`${key}\` |`);
  }
  for (const key of diff.changed) {
    rows.push(`| ✏️ Changed | \`${key}\` |`);
  }
  for (const key of diff.unchanged) {
    rows.push(`| — Unchanged | \`${key}\` |`);
  }

  if (rows.length === 4) {
    rows.push('| — | _none_ |');
  }

  return rows.join('\n');
}
