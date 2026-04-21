/**
 * Invert an env map: swap keys and values.
 * Keys become values, values become keys.
 */

export type EnvMap = Record<string, string>;

export interface InvertResult {
  inverted: EnvMap;
  /** Keys that were dropped because their value was already used as a key (collision). */
  collisions: Array<{ originalKey: string; originalValue: string; collidingKey: string }>;
  /** Keys that were dropped because their value was empty or whitespace. */
  skipped: string[];
}

/**
 * Invert a single env map.
 * Values that are empty or duplicate (after inversion) are handled according to options.
 */
export function invertEnvMap(
  env: EnvMap,
  options: { skipEmpty?: boolean; onCollision?: "first" | "last" } = {}
): InvertResult {
  const { skipEmpty = true, onCollision = "first" } = options;

  const inverted: EnvMap = {};
  const collisions: InvertResult["collisions"] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (skipEmpty && value.trim() === "") {
      skipped.push(key);
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(inverted, value)) {
      if (onCollision === "last") {
        const collidingKey = inverted[value];
        collisions.push({ originalKey: key, originalValue: value, collidingKey });
        inverted[value] = key;
      } else {
        collisions.push({ originalKey: key, originalValue: value, collidingKey: inverted[value] });
      }
    } else {
      inverted[value] = key;
    }
  }

  return { inverted, collisions, skipped };
}

/**
 * Invert multiple named env maps.
 */
export function invertMultipleEnvMaps(
  maps: Record<string, EnvMap>,
  options?: { skipEmpty?: boolean; onCollision?: "first" | "last" }
): Record<string, InvertResult> {
  const results: Record<string, InvertResult> = {};
  for (const [name, env] of Object.entries(maps)) {
    results[name] = invertEnvMap(env, options);
  }
  return results;
}

/**
 * Returns true if the inversion produced any collisions or skipped entries.
 */
export function hasInvertIssues(result: InvertResult): boolean {
  return result.collisions.length > 0 || result.skipped.length > 0;
}
