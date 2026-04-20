import type { EnvMap } from '../parser/envParser';

export interface GroupedEnvMaps {
  groups: Record<string, Record<string, EnvMap>>;
  ungrouped: Record<string, EnvMap>;
}

export interface GroupOptions {
  delimiter?: string;
  maxDepth?: number;
}

const DEFAULT_DELIMITER = '_';

/**
 * Extracts the group prefix from a key based on a delimiter and maxDepth.
 */
export function extractGroupPrefix(
  key: string,
  delimiter: string = DEFAULT_DELIMITER,
  maxDepth: number = 1
): string | null {
  const parts = key.split(delimiter);
  if (parts.length <= maxDepth) return null;
  return parts.slice(0, maxDepth).join(delimiter);
}

/**
 * Groups keys within a single EnvMap by their common prefix.
 */
export function groupEnvMap(
  envMap: EnvMap,
  options: GroupOptions = {}
): Record<string, EnvMap> {
  const { delimiter = DEFAULT_DELIMITER, maxDepth = 1 } = options;
  const groups: Record<string, EnvMap> = {};

  for (const [key, value] of Object.entries(envMap)) {
    const prefix = extractGroupPrefix(key, delimiter, maxDepth);
    const groupKey = prefix ?? '__ungrouped__';
    if (!groups[groupKey]) groups[groupKey] = {};
    groups[groupKey][key] = value;
  }

  return groups;
}

/**
 * Groups multiple EnvMaps by source name and key prefix.
 */
export function groupMultipleEnvMaps(
  envMaps: Record<string, EnvMap>,
  options: GroupOptions = {}
): GroupedEnvMaps {
  const { delimiter = DEFAULT_DELIMITER, maxDepth = 1 } = options;
  const groups: Record<string, Record<string, EnvMap>> = {};
  const ungrouped: Record<string, EnvMap> = {};

  for (const [source, envMap] of Object.entries(envMaps)) {
    const grouped = groupEnvMap(envMap, { delimiter, maxDepth });
    for (const [prefix, keys] of Object.entries(grouped)) {
      if (prefix === '__ungrouped__') {
        ungrouped[source] = { ...(ungrouped[source] ?? {}), ...keys };
      } else {
        if (!groups[prefix]) groups[prefix] = {};
        groups[prefix][source] = keys;
      }
    }
  }

  return { groups, ungrouped };
}
