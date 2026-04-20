import type { RenameResult, RenameMap } from './renameKeys';

export function formatRenameResult(result: RenameResult, label?: string): string {
  const lines: string[] = [];
  const header = label ? `Rename result for [${label}]` : 'Rename result';
  lines.push(header);
  lines.push('='.repeat(header.length));

  const appliedEntries = Object.entries(result.applied);
  if (appliedEntries.length > 0) {
    lines.push('\nRenamed:');
    for (const [oldKey, newKey] of appliedEntries) {
      lines.push(`  ${oldKey} → ${newKey}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push('\nSkipped (key not found):');
    for (const key of result.skipped) {
      lines.push(`  ${key}`);
    }
  }

  if (result.conflicts.length > 0) {
    lines.push('\nConflicts (target key already exists):');
    for (const key of result.conflicts) {
      lines.push(`  ${key}`);
    }
  }

  if (appliedEntries.length === 0 && result.skipped.length === 0 && result.conflicts.length === 0) {
    lines.push('  No changes.');
  }

  return lines.join('\n');
}

export function formatMultipleRenameResults(
  results: Record<string, RenameResult>
): string {
  return Object.entries(results)
    .map(([label, result]) => formatRenameResult(result, label))
    .join('\n\n');
}

export function countRenameStats(result: RenameResult): {
  renamed: number;
  skipped: number;
  conflicts: number;
} {
  return {
    renamed: Object.keys(result.applied).length,
    skipped: result.skipped.length,
    conflicts: result.conflicts.length,
  };
}
