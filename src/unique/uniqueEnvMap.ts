/**
 * uniqueEnvMap — filter an env map to only keys with unique values,
 * or across multiple maps return keys whose values are unique to exactly one map.
 */

export type EnvMap = Record<string, string>;

export interface UniqueResult {
  source: string;
  entries: EnvMap;
  duplicateKeysRemoved: string[];
}

/**
 * Within a single map, remove entries whose value appears more than once.
 * Returns only entries with a value that is unique (appears exactly once).
 */
export function uniqueEnvMap(map: EnvMap): UniqueResult {
  const valueCounts: Record<string, number> = {};

  for (const value of Object.values(map)) {
    valueCounts[value] = (valueCounts[value] ?? 0) + 1;
  }

  const entries: EnvMap = {};
  const duplicateKeysRemoved: string[] = [];

  for (const [key, value] of Object.entries(map)) {
    if (valueCounts[value] === 1) {
      entries[key] = value;
    } else {
      duplicateKeysRemoved.push(key);
    }
  }

  return { source: '', entries, duplicateKeysRemoved };
}

/**
 * Across multiple maps, for each map return only the keys whose value
 * does not appear in any of the other maps (value is unique to that map).
 */
export function uniqueMultipleEnvMaps(
  maps: Record<string, EnvMap>
): Record<string, UniqueResult> {
  const allValues: Record<string, Set<string>> = {};

  // Build a set of source names per value
  for (const [source, map] of Object.entries(maps)) {
    for (const value of Object.values(map)) {
      if (!allValues[value]) allValues[value] = new Set();
      allValues[value].add(source);
    }
  }

  const results: Record<string, UniqueResult> = {};

  for (const [source, map] of Object.entries(maps)) {
    const entries: EnvMap = {};
    const duplicateKeysRemoved: string[] = [];

    for (const [key, value] of Object.entries(map)) {
      if (allValues[value].size === 1) {
        entries[key] = value;
      } else {
        duplicateKeysRemoved.push(key);
      }
    }

    results[source] = { source, entries, duplicateKeysRemoved };
  }

  return results;
}

export function hasUniqueResults(result: UniqueResult): boolean {
  return Object.keys(result.entries).length > 0;
}
