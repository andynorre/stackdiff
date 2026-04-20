/**
 * Utilities for sorting environment variable maps by key or value.
 */

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  caseSensitive?: boolean;
}

export interface SortResult {
  source: string;
  original: Record<string, string>;
  sorted: Record<string, string>;
  keys: string[];
}

/**
 * Sort a single env map by its keys.
 */
export function sortEnvMap(
  source: string,
  env: Record<string, string>,
  options: SortOptions = {}
): SortResult {
  const { order = 'asc', caseSensitive = false } = options;

  const keys = Object.keys(env).sort((a, b) => {
    const ka = caseSensitive ? a : a.toLowerCase();
    const kb = caseSensitive ? b : b.toLowerCase();
    if (ka < kb) return order === 'asc' ? -1 : 1;
    if (ka > kb) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const sorted: Record<string, string> = {};
  for (const key of keys) {
    sorted[key] = env[key];
  }

  return { source, original: env, sorted, keys };
}

/**
 * Sort multiple env maps by their keys.
 */
export function sortMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: SortOptions = {}
): Record<string, SortResult> {
  const results: Record<string, SortResult> = {};
  for (const [source, env] of Object.entries(envMaps)) {
    results[source] = sortEnvMap(source, env, options);
  }
  return results;
}

/**
 * Check whether an env map is already sorted.
 */
export function isSorted(
  env: Record<string, string>,
  options: SortOptions = {}
): boolean {
  const { order = 'asc', caseSensitive = false } = options;
  const keys = Object.keys(env);
  for (let i = 0; i < keys.length - 1; i++) {
    const ka = caseSensitive ? keys[i] : keys[i].toLowerCase();
    const kb = caseSensitive ? keys[i + 1] : keys[i + 1].toLowerCase();
    if (order === 'asc' && ka > kb) return false;
    if (order === 'desc' && ka < kb) return false;
  }
  return true;
}
