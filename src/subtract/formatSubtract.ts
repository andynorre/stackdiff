import type { SubtractResult, MultipleSubtractResult } from './subtractEnvMap';

export interface SubtractStats {
  removed: number;
  retained: number;
}

export function collectSubtractStats(result: SubtractResult): SubtractStats {
  return {
    removed: result.removed.length,
    retained: result.retained.length,
  };
}

export function formatSubtractResult(name: string, result: SubtractResult): string {
  const stats = collectSubtractStats(result);
  const lines: string[] = [`[${name}]`];

  if (stats.removed === 0) {
    lines.push('  No keys removed.');
  } else {
    lines.push(`  Removed (${stats.removed}):`);
    for (const key of result.removed) {
      lines.push(`    - ${key}`);
    }
  }

  lines.push(`  Retained: ${stats.retained} key(s)`);
  return lines.join('\n');
}

export function formatMultipleSubtractResults(results: MultipleSubtractResult): string {
  return Object.entries(results)
    .map(([name, result]) => formatSubtractResult(name, result))
    .join('\n\n');
}

export function countSubtractedTotal(results: MultipleSubtractResult): number {
  return Object.values(results).reduce((sum, r) => sum + r.removed.length, 0);
}
