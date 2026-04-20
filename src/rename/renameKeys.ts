import type { EnvMap } from '../parser/envParser';

export interface RenameMap {
  [oldKey: string]: string;
}

export interface RenameResult {
  renamed: EnvMap;
  applied: RenameMap;
  skipped: string[];
  conflicts: string[];
}

/**
 * Rename keys in an EnvMap according to a RenameMap.
 * Skips renames where the old key does not exist.
 * Flags conflicts where the new key already exists.
 */
export function renameKeys(envMap: EnvMap, renameMap: RenameMap): RenameResult {
  const renamed: EnvMap = { ...envMap };
  const applied: RenameMap = {};
  const skipped: string[] = [];
  const conflicts: string[] = [];

  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (!(oldKey in renamed)) {
      skipped.push(oldKey);
      continue;
    }
    if (newKey in renamed && newKey !== oldKey) {
      conflicts.push(newKey);
      continue;
    }
    const value = renamed[oldKey];
    delete renamed[oldKey];
    renamed[newKey] = value;
    applied[oldKey] = newKey;
  }

  return { renamed, applied, skipped, conflicts };
}

/**
 * Apply the same rename map across multiple named EnvMaps.
 */
export function renameKeysInMultiple(
  envMaps: Record<string, EnvMap>,
  renameMap: RenameMap
): Record<string, RenameResult> {
  const results: Record<string, RenameResult> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    results[name] = renameKeys(envMap, renameMap);
  }
  return results;
}

export function hasRenameConflicts(result: RenameResult): boolean {
  return result.conflicts.length > 0;
}
