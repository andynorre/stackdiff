import type { ReplaceResult } from './replaceEnvMap';

export interface ReplaceStats {
  keyChanges: number;
  valueChanges: number;
  totalChanges: number;
}

export function collectReplaceStats(result: ReplaceResult): ReplaceStats {
  const keyChanges = result.changes.filter(c => c.field === 'key').length;
  const valueChanges = result.changes.filter(c => c.field === 'value').length;
  return { keyChanges, valueChanges, totalChanges: result.changes.length };
}

export function formatReplaceResult(name: string, result: ReplaceResult): string {
  const stats = collectReplaceStats(result);
  if (stats.totalChanges === 0) {
    return `[${name}] No replacements made.`;
  }

  const lines: string[] = [`[${name}] ${stats.totalChanges} replacement(s) made:`];

  for (const change of result.changes) {
    if (change.field === 'key') {
      lines.push(`  key:   "${change.from}" → "${change.to}"`);
    } else {
      lines.push(`  value: ${change.key}: "${change.from}" → "${change.to}"`);
    }
  }

  return lines.join('\n');
}

export function formatMultipleReplaceResults(
  results: Record<string, ReplaceResult>
): string {
  return Object.entries(results)
    .map(([name, result]) => formatReplaceResult(name, result))
    .join('\n\n');
}

export function countReplacedTotal(results: Record<string, ReplaceResult>): number {
  return Object.values(results).reduce((sum, r) => sum + r.changes.length, 0);
}
