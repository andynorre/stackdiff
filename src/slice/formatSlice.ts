import type { EnvMap } from '../parser/envParser';

export interface SliceResult {
  source: string;
  original: EnvMap;
  sliced: EnvMap;
  keys: string[];
}

export interface SliceSummary {
  totalKeys: number;
  includedKeys: number;
  excludedKeys: number;
  keys: string[];
}

export function collectSliceStats(original: EnvMap, sliced: EnvMap): SliceSummary {
  const totalKeys = Object.keys(original).length;
  const includedKeys = Object.keys(sliced).length;
  const excludedKeys = totalKeys - includedKeys;
  const keys = Object.keys(sliced);
  return { totalKeys, includedKeys, excludedKeys, keys };
}

export function formatSliceResult(result: SliceResult): string {
  const stats = collectSliceStats(result.original, result.sliced);
  const lines: string[] = [
    `Slice: ${result.source}`,
    `  Total keys:    ${stats.totalKeys}`,
    `  Included keys: ${stats.includedKeys}`,
    `  Excluded keys: ${stats.excludedKeys}`,
  ];
  if (stats.keys.length > 0) {
    lines.push(`  Keys: ${stats.keys.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatMultipleSliceResults(results: SliceResult[]): string {
  if (results.length === 0) return 'No slice results.';
  return results.map(formatSliceResult).join('\n\n');
}

export function countSlicedTotal(results: SliceResult[]): number {
  return results.reduce((sum, r) => sum + Object.keys(r.sliced).length, 0);
}
