import type { UpsertResult, MultipleUpsertResult } from './upsertEnvMap';

export function collectUpsertStats(result: UpsertResult): {
  inserted: number;
  updated: number;
  total: number;
} {
  return {
    inserted: result.inserted.length,
    updated: result.updated.length,
    total: result.inserted.length + result.updated.length,
  };
}

export function formatUpsertResult(name: string, result: UpsertResult): string {
  const stats = collectUpsertStats(result);
  const lines: string[] = [`[${name}]`];

  if (result.inserted.length > 0) {
    lines.push(`  + inserted (${result.inserted.length}): ${result.inserted.join(', ')}`);
  }
  if (result.updated.length > 0) {
    lines.push(`  ~ updated  (${result.updated.length}): ${result.updated.join(', ')}`);
  }
  if (stats.total === 0) {
    lines.push('  (no changes)');
  }

  return lines.join('\n');
}

export function formatMultipleUpsertResults(
  multiResult: MultipleUpsertResult
): string {
  return Object.entries(multiResult.results)
    .map(([name, result]) => formatUpsertResult(name, result))
    .join('\n\n');
}

export function countUpsertedTotal(multiResult: MultipleUpsertResult): number {
  return Object.values(multiResult.results).reduce(
    (sum, r) => sum + r.inserted.length + r.updated.length,
    0
  );
}
