export type DedupeStrategy = 'first' | 'last' | 'error';

export interface DedupeResult {
  deduped: Record<string, string>;
  duplicates: Record<string, string[]>;
  hadDuplicates: boolean;
}

/**
 * Finds duplicate keys across multiple env maps and deduplicates them
 * according to the given strategy.
 */
export function dedupeEnvMap(
  maps: Record<string, string>[],
  strategy: DedupeStrategy = 'first'
): DedupeResult {
  const seen = new Map<string, string[]>();

  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(value);
    }
  }

  const duplicates: Record<string, string[]> = {};
  const deduped: Record<string, string> = {};

  for (const [key, values] of seen.entries()) {
    if (values.length > 1) {
      duplicates[key] = values;
    }

    if (strategy === 'error' && values.length > 1) {
      throw new Error(
        `Duplicate key "${key}" found in multiple env maps: [${values.join(', ')}]`
      );
    }

    deduped[key] = strategy === 'last' ? values[values.length - 1] : values[0];
  }

  return {
    deduped,
    duplicates,
    hadDuplicates: Object.keys(duplicates).length > 0,
  };
}

/**
 * Returns only the keys that appear more than once across all provided maps.
 */
export function findDuplicateKeys(
  maps: Record<string, string>[]
): string[] {
  const counts = new Map<string, number>();

  for (const map of maps) {
    for (const key of Object.keys(map)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key);
}
