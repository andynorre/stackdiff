import type { EnvMap } from '../parser/envParser';

export interface SyncResult {
  source: string;
  target: string;
  added: Record<string, string>;
  removed: string[];
  updated: Record<string, string>;
}

export interface SyncOptions {
  dryRun?: boolean;
  overwrite?: boolean;
}

/**
 * Syncs keys from source into target, returning what would change.
 * Does not mutate the originals — returns a new merged map.
 */
export function syncEnvMaps(
  source: EnvMap,
  target: EnvMap,
  sourceLabel: string,
  targetLabel: string,
  options: SyncOptions = {}
): { result: SyncResult; synced: EnvMap } {
  const added: Record<string, string> = {};
  const updated: Record<string, string> = {};
  const removed: string[] = [];

  // Keys in source but not in target → added
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      added[key] = value;
    } else if (options.overwrite && target[key] !== value) {
      updated[key] = value;
    }
  }

  // Keys in target but not in source → removed (only tracked, not applied unless overwrite)
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      removed.push(key);
    }
  }

  const synced: EnvMap = { ...target, ...added };

  if (options.overwrite) {
    for (const [key, value] of Object.entries(updated)) {
      synced[key] = value;
    }
  }

  const result: SyncResult = {
    source: sourceLabel,
    target: targetLabel,
    added,
    removed,
    updated,
  };

  return { result, synced };
}

export function hasSyncChanges(result: SyncResult): boolean {
  return (
    Object.keys(result.added).length > 0 ||
    Object.keys(result.updated).length > 0 ||
    result.removed.length > 0
  );
}
