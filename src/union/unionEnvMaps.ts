/**
 * unionEnvMaps — merge multiple env maps keeping all keys,
 * resolving conflicts by preferring the last-seen value (or first, configurable).
 */

export type UnionStrategy = 'first' | 'last';

export interface UnionOptions {
  strategy?: UnionStrategy;
}

export interface UnionResult {
  merged: Record<string, string>;
  /** keys that appeared in more than one source */
  conflicts: Record<string, string[]>;
  /** total number of unique keys */
  totalKeys: number;
  /** number of conflicting keys */
  conflictCount: number;
}

/**
 * Produce a union of all provided env maps.
 * @param maps  Named env maps to union together.
 * @param opts  Strategy: 'first' keeps the first value seen; 'last' (default) keeps the last.
 */
export function unionEnvMaps(
  maps: Record<string, Record<string, string>>,
  opts: UnionOptions = {}
): UnionResult {
  const strategy: UnionStrategy = opts.strategy ?? 'last';
  const merged: Record<string, string> = {};
  const seen: Record<string, string[]> = {};

  for (const [, env] of Object.entries(maps)) {
    for (const [key, value] of Object.entries(env)) {
      if (!seen[key]) {
        seen[key] = [];
      }
      seen[key].push(value);

      if (strategy === 'first') {
        if (!(key in merged)) {
          merged[key] = value;
        }
      } else {
        merged[key] = value;
      }
    }
  }

  const conflicts: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(seen)) {
    const unique = [...new Set(values)];
    if (unique.length > 1) {
      conflicts[key] = unique;
    }
  }

  return {
    merged,
    conflicts,
    totalKeys: Object.keys(merged).length,
    conflictCount: Object.keys(conflicts).length,
  };
}

/**
 * Returns true when the union result contains at least one conflicting key.
 */
export function hasUnionConflicts(result: UnionResult): boolean {
  return result.conflictCount > 0;
}
