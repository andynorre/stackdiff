import type { MergeResult } from './mergeEnvMaps';

export function formatMergeResult(result: MergeResult): string {
  const lines: string[] = [];

  const keyCount = Object.keys(result.merged).length;
  lines.push(`Merged ${keyCount} key(s) from ${countSources(result)} source(s).`);

  const conflictKeys = Object.keys(result.conflicts);
  if (conflictKeys.length === 0) {
    lines.push('No conflicts detected.');
  } else {
    lines.push(`\n${conflictKeys.length} conflict(s) detected:`);
    for (const key of conflictKeys) {
      const { sources, values } = result.conflicts[key];
      lines.push(`  ${key}:`);
      sources.forEach((src, i) => {
        lines.push(`    [${src}] ${values[i] ?? '(missing)'}`);
      });
    }
  }

  return lines.join('\n');
}

function countSources(result: MergeResult): number {
  const allSources = new Set<string>();
  for (const srcs of Object.values(result.origins)) {
    srcs.forEach((s) => allSources.add(s));
  }
  return allSources.size;
}
