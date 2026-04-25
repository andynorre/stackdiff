import type { OmitResult } from './omitEnvMap';

export type OmitStats = {
  total: number;
  omitted: number;
  retained: number;
};

export function collectOmitStats(result: OmitResult): OmitStats {
  return {
    total: result.omitted.length + result.retained.length,
    omitted: result.omitted.length,
    retained: result.retained.length,
  };
}

export function formatOmitResult(name: string, result: OmitResult): string {
  const stats = collectOmitStats(result);
  const lines: string[] = [`[${name}]`];

  if (result.omitted.length === 0) {
    lines.push('  No keys omitted.');
  } else {
    lines.push(`  Omitted (${stats.omitted}):`);
    for (const key of result.omitted) {
      lines.push(`    - ${key}`);
    }
  }

  lines.push(`  Retained: ${stats.retained} / ${stats.total}`);
  return lines.join('\n');
}

export function formatMultipleOmitResults(
  results: Record<string, OmitResult>
): string {
  return Object.entries(results)
    .map(([name, result]) => formatOmitResult(name, result))
    .join('\n\n');
}

export function countOmittedTotal(
  results: Record<string, OmitResult>
): number {
  return Object.values(results).reduce((sum, r) => sum + r.omitted.length, 0);
}
