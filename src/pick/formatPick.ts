import type { PickResult, MultiplePickResult } from './pickEnvMap';

export interface PickStats {
  picked: number;
  missing: number;
}

export function collectPickStats(result: PickResult): PickStats {
  return {
    picked: result.total,
    missing: result.missing.length,
  };
}

export function formatPickResult(source: string, result: PickResult): string {
  const lines: string[] = [];
  const stats = collectPickStats(result);

  lines.push(`[${source}]`);
  lines.push(`  Picked : ${stats.picked}`);
  lines.push(`  Missing: ${stats.missing}`);

  if (result.missing.length > 0) {
    lines.push(`  Missing keys: ${result.missing.join(', ')}`);
  }

  for (const [key, value] of Object.entries(result.picked)) {
    lines.push(`  ${key}=${value}`);
  }

  return lines.join('\n');
}

export function formatMultiplePickResults(
  results: MultiplePickResult
): string {
  return Object.entries(results)
    .map(([source, result]) => formatPickResult(source, result))
    .join('\n\n');
}

export function countPickedTotal(results: MultiplePickResult): number {
  return Object.values(results).reduce((sum, r) => sum + r.total, 0);
}
