/**
 * freezeEnvMap — mark keys as read-only by recording a frozen snapshot
 * of an env map, then detect any mutations against that baseline.
 */

export interface FreezeResult {
  frozen: Record<string, string>;
  frozenKeys: string[];
}

export interface MutationResult {
  mutated: string[];
  added: string[];
  removed: string[];
  unchanged: string[];
  hasMutations: boolean;
}

/**
 * Freeze an env map, optionally restricting to a subset of keys.
 */
export function freezeEnvMap(
  envMap: Record<string, string>,
  keys?: string[]
): FreezeResult {
  const frozenKeys = keys ?? Object.keys(envMap);
  const frozen: Record<string, string> = {};

  for (const key of frozenKeys) {
    if (key in envMap) {
      frozen[key] = envMap[key];
    }
  }

  return { frozen, frozenKeys: Object.keys(frozen) };
}

/**
 * Compare a current env map against a previously frozen baseline.
 * Returns which keys were mutated, added, removed, or unchanged.
 */
export function detectMutations(
  frozen: Record<string, string>,
  current: Record<string, string>
): MutationResult {
  const frozenKeys = new Set(Object.keys(frozen));
  const currentKeys = new Set(Object.keys(current));

  const mutated: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  for (const key of frozenKeys) {
    if (!currentKeys.has(key)) {
      removed.push(key);
    } else if (current[key] !== frozen[key]) {
      mutated.push(key);
    } else {
      unchanged.push(key);
    }
  }

  for (const key of currentKeys) {
    if (!frozenKeys.has(key)) {
      added.push(key);
    }
  }

  return {
    mutated,
    added,
    removed,
    unchanged,
    hasMutations: mutated.length > 0 || added.length > 0 || removed.length > 0,
  };
}

/**
 * Convenience: freeze multiple env maps by label.
 */
export function freezeMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  keys?: string[]
): Record<string, FreezeResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([label, envMap]) => [
      label,
      freezeEnvMap(envMap, keys),
    ])
  );
}
