/**
 * Interpolates variable references within an env map.
 * Supports ${VAR} and $VAR syntax for self-referencing within the same map.
 */

export type EnvMap = Record<string, string>;

export interface InterpolationResult {
  interpolated: EnvMap;
  unresolved: string[];
}

const VAR_PATTERN = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;

/**
 * Resolves a single value against a given context map.
 * Returns the resolved string and any keys that could not be resolved.
 */
export function resolveValue(
  value: string,
  context: EnvMap
): { resolved: string; unresolved: string[] } {
  const unresolved: string[] = [];

  const resolved = value.replace(VAR_PATTERN, (_match, braced, bare) => {
    const key = braced ?? bare;
    if (key in context) {
      return context[key];
    }
    unresolved.push(key);
    return _match;
  });

  return { resolved, unresolved };
}

/**
 * Interpolates all values in an EnvMap using the map itself as context.
 * Performs a single pass — nested/chained references are not expanded.
 */
export function interpolateEnvMap(
  envMap: EnvMap,
  externalContext: EnvMap = {}
): InterpolationResult {
  const context: EnvMap = { ...externalContext, ...envMap };
  const interpolated: EnvMap = {};
  const allUnresolved: string[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    const { resolved, unresolved } = resolveValue(value, context);
    interpolated[key] = resolved;
    allUnresolved.push(...unresolved);
  }

  return {
    interpolated,
    unresolved: [...new Set(allUnresolved)],
  };
}

/**
 * Interpolates multiple named EnvMaps independently, each with the same
 * optional external context.
 */
export function interpolateMultipleEnvMaps(
  envMaps: Record<string, EnvMap>,
  externalContext: EnvMap = {}
): Record<string, InterpolationResult> {
  const results: Record<string, InterpolationResult> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    results[name] = interpolateEnvMap(envMap, externalContext);
  }
  return results;
}
