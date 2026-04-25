import type { PrefixResult } from './prefixEnvMap';

export function collectPrefixStats(result: PrefixResult): {
  total: number;
  added: number;
  skipped: number;
} {
  return {
    total: Object.keys(result.result).length,
    added: result.added.length,
    skipped: result.skipped.length,
  };
}

export function formatPrefixResult(name: string, result: PrefixResult): string {
  const stats = collectPrefixStats(result);
  const lines: string[] = [`[${name}]`];
  lines.push(`  Total keys : ${stats.total}`);
  lines.push(`  Prefixed   : ${stats.added}`);
  if (stats.skipped > 0) {
    lines.push(`  Skipped    : ${stats.skipped}`);
    for (const key of result.skipped) {
      lines.push(`    - ${key} (conflict)`);
    }
  }
  return lines.join('\n');
}

export function formatMultiplePrefixResults(
  results: Record<string, PrefixResult>
): string {
  return Object.entries(results)
    .map(([name, result]) => formatPrefixResult(name, result))
    .join('\n\n');
}

export function countPrefixedTotal(
  results: Record<string, PrefixResult>
): number {
  return Object.values(results).reduce((sum, r) => sum + r.added.length, 0);
}
