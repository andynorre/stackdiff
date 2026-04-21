/**
 * subtractEnvMap: remove keys from one env map that exist in another.
 */

export type EnvMap = Record<string, string>;

export interface SubtractResult {
  result: EnvMap;
  removed: string[];
  retained: string[];
}

export interface MultipleSubtractResult {
  [source: string]: SubtractResult;
}

/**
 * Returns a new EnvMap containing only keys from `base` that are NOT present in `subtrahend`.
 */
export function subtractEnvMap(base: EnvMap, subtrahend: EnvMap): SubtractResult {
  const result: EnvMap = {};
  const removed: string[] = [];
  const retained: string[] = [];

  for (const key of Object.keys(base)) {
    if (Object.prototype.hasOwnProperty.call(subtrahend, key)) {
      removed.push(key);
    } else {
      result[key] = base[key];
      retained.push(key);
    }
  }

  return { result, removed, retained };
}

/**
 * Applies subtractEnvMap to multiple named env maps against a single subtrahend.
 */
export function subtractMultipleEnvMaps(
  sources: Record<string, EnvMap>,
  subtrahend: EnvMap
): MultipleSubtractResult {
  const output: MultipleSubtractResult = {};
  for (const [name, envMap] of Object.entries(sources)) {
    output[name] = subtractEnvMap(envMap, subtrahend);
  }
  return output;
}

/**
 * Returns true if any keys were removed from the base map.
 */
export function hasSubtractChanges(result: SubtractResult): boolean {
  return result.removed.length > 0;
}
