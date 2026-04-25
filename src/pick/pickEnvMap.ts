export type PickEnvMap = Record<string, string>;

export interface PickResult {
  picked: PickEnvMap;
  missing: string[];
  total: number;
}

export interface MultiplePickResult {
  [source: string]: PickResult;
}

/**
 * Pick only the specified keys from an env map.
 * Keys not found in the source are tracked as missing.
 */
export function pickEnvMap(
  env: PickEnvMap,
  keys: string[]
): PickResult {
  const picked: PickEnvMap = {};
  const missing: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      picked[key] = env[key];
    } else {
      missing.push(key);
    }
  }

  return {
    picked,
    missing,
    total: Object.keys(picked).length,
  };
}

/**
 * Pick specified keys from multiple named env maps.
 */
export function pickMultipleEnvMaps(
  envMaps: Record<string, PickEnvMap>,
  keys: string[]
): MultiplePickResult {
  const results: MultiplePickResult = {};
  for (const [source, env] of Object.entries(envMaps)) {
    results[source] = pickEnvMap(env, keys);
  }
  return results;
}

/**
 * Returns true if any keys were successfully picked.
 */
export function hasPickResults(result: PickResult): boolean {
  return result.total > 0;
}
