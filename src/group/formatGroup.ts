import type { GroupedEnvMaps } from './groupEnvMaps';

/**
 * Formats a grouped env map summary as plain text.
 */
export function formatGroupSummary(grouped: GroupedEnvMaps): string {
  const lines: string[] = [];

  const groupNames = Object.keys(grouped.groups).sort();
  if (groupNames.length === 0 && Object.keys(grouped.ungrouped).length === 0) {
    return 'No groups found.';
  }

  for (const groupName of groupNames) {
    const sources = grouped.groups[groupName];
    const sourceNames = Object.keys(sources).sort();
    const keyCount = Object.values(sources).reduce(
      (sum, map) => sum + Object.keys(map).length,
      0
    );
    lines.push(`[${groupName}] — ${sourceNames.length} source(s), ${keyCount} key(s)`);
    for (const source of sourceNames) {
      const keys = Object.keys(sources[source]).sort();
      lines.push(`  ${source}: ${keys.join(', ')}`);
    }
  }

  const ungroupedSources = Object.keys(grouped.ungrouped).sort();
  if (ungroupedSources.length > 0) {
    lines.push('[ungrouped]');
    for (const source of ungroupedSources) {
      const keys = Object.keys(grouped.ungrouped[source]).sort();
      lines.push(`  ${source}: ${keys.join(', ')}`);
    }
  }

  return lines.join('\n');
}

/**
 * Returns a count of keys per group across all sources.
 */
export function countGroupKeys(grouped: GroupedEnvMaps): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const [groupName, sources] of Object.entries(grouped.groups)) {
    counts[groupName] = Object.values(sources).reduce(
      (sum, map) => sum + Object.keys(map).length,
      0
    );
  }

  const ungroupedCount = Object.values(grouped.ungrouped).reduce(
    (sum, map) => sum + Object.keys(map).length,
    0
  );
  if (ungroupedCount > 0) {
    counts['__ungrouped__'] = ungroupedCount;
  }

  return counts;
}
