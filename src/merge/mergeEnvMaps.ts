/**
 * Merges multiple env maps into a single map.
 * Later sources override earlier ones (like Object.assign).
 * Tracks the origin of each key.
 */

export type EnvMap = Record<string, string>;

export interface MergeResult {
  merged: EnvMap;
  origins: Record<string, string[]>;
  conflicts: Record<string, { sources: string[]; values: string[] }>;
}

export function mergeEnvMaps(
  maps: Record<string, EnvMap>
): MergeResult {
  const merged: EnvMap = {};
  const origins: Record<string, string[]> = {};
  const conflicts: Record<string, { sources: string[]; values: string[] }> = {};

  for (const [source, envMap] of Object.entries(maps)) {
    for (const [key, value] of Object.entries(envMap)) {
      if (key in merged && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = {
            sources: [...(origins[key] ?? [])],
            values: [merged[key]],
          };
        }
        conflicts[key].sources.push(source);
        conflicts[key].values.push(value);
      }

      merged[key] = value;

      if (!origins[key]) {
        origins[key] = [];
      }
      if (!origins[key].includes(source)) {
        origins[key].push(source);
      }
    }
  }

  return { merged, origins, conflicts };
}

export function hasConflicts(result: MergeResult): boolean {
  return Object.keys(result.conflicts).length > 0;
}
