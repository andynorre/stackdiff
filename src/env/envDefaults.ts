import type { EnvMap } from '../parser/envParser';

export interface DefaultsOptions {
  overwrite?: boolean;
}

/**
 * Apply default values to an EnvMap.
 * Only sets a key if it is missing (or empty when overwrite is false).
 */
export function applyDefaults(
  target: EnvMap,
  defaults: EnvMap,
  options: DefaultsOptions = {}
): EnvMap {
  const { overwrite = false } = options;
  const result: EnvMap = { ...target };

  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in result) || (overwrite && result[key] === '')) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Apply defaults to multiple named EnvMaps.
 */
export function applyDefaultsToMultiple(
  targets: Record<string, EnvMap>,
  defaults: EnvMap,
  options: DefaultsOptions = {}
): Record<string, EnvMap> {
  return Object.fromEntries(
    Object.entries(targets).map(([name, envMap]) => [
      name,
      applyDefaults(envMap, defaults, options),
    ])
  );
}

/**
 * Return keys present in defaults but missing from the target map.
 */
export function missingDefaults(target: EnvMap, defaults: EnvMap): string[] {
  return Object.keys(defaults).filter((key) => !(key in target));
}
