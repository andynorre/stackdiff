export interface UpsertOperation {
  key: string;
  value: string;
}

export interface UpsertResult {
  map: Record<string, string>;
  inserted: string[];
  updated: string[];
}

export interface MultipleUpsertResult {
  results: Record<string, UpsertResult>;
}

/**
 * Insert or update key-value pairs in an env map.
 * Returns a new map along with lists of inserted and updated keys.
 */
export function upsertEnvMap(
  envMap: Record<string, string>,
  operations: UpsertOperation[]
): UpsertResult {
  const map = { ...envMap };
  const inserted: string[] = [];
  const updated: string[] = [];

  for (const { key, value } of operations) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      updated.push(key);
    } else {
      inserted.push(key);
    }
    map[key] = value;
  }

  return { map, inserted, updated };
}

/**
 * Apply upsert operations to multiple named env maps.
 */
export function upsertMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  operations: UpsertOperation[]
): MultipleUpsertResult {
  const results: Record<string, UpsertResult> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    results[name] = upsertEnvMap(envMap, operations);
  }
  return { results };
}

/**
 * Returns true if any keys were inserted or updated.
 */
export function hasUpsertChanges(result: UpsertResult): boolean {
  return result.inserted.length > 0 || result.updated.length > 0;
}
