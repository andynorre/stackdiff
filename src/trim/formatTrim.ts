import type { TrimOptions } from './trimEnvMap';

export type TrimStat = {
  key: string;
  before: string;
  after: string;
};

export function collectTrimStats(
  original: Record<string, string>,
  trimmed: Record<string, string>
): TrimStat[] {
  const stats: TrimStat[] = [];
  for (const key of Object.keys(original)) {
    if (original[key] !== trimmed[key]) {
      stats.push({ key, before: original[key], after: trimmed[key] });
    }
  }
  return stats;
}

export function formatTrimResult(
  name: string,
  stats: TrimStat[],
  options: TrimOptions = {}
): string {
  const lines: string[] = [];
  lines.push(`Trim result for: ${name}`);
  if (stats.length === 0) {
    lines.push('  No changes.');
    return lines.join('\n');
  }
  lines.push(`  ${stats.length} key(s) modified:`);
  for (const s of stats) {
    lines.push(`  ${s.key}: ${JSON.stringify(s.before)} → ${JSON.stringify(s.after)}`);
  }
  const flags: string[] = [];
  if (options.trimKeys) flags.push('trimKeys');
  if (options.trimValues !== false) flags.push('trimValues');
  if (options.stripQuotes !== false) flags.push('stripQuotes');
  if (flags.length) lines.push(`  Options: ${flags.join(', ')}`);
  return lines.join('\n');
}

export function formatMultipleTrimResults(
  results: Record<string, TrimStat[]>,
  options: TrimOptions = {}
): string {
  return Object.entries(results)
    .map(([name, stats]) => formatTrimResult(name, stats, options))
    .join('\n\n');
}
