/**
 * Flattens nested environment variable groups into a single-level map,
 * and provides the reverse operation (expand) for structured env maps.
 */

export type EnvMap = Record<string, string>;
export type NestedEnvMap = Record<string, string | Record<string, string>>;

/**
 * Flattens a nested env map into a flat key=value map.
 * Nested keys are joined with the provided separator (default: "__").
 *
 * @example
 * flattenEnvMap({ DB: { HOST: 'localhost', PORT: '5432' } })
 * // => { DB__HOST: 'localhost', DB__PORT: '5432' }
 */
export function flattenEnvMap(
  nested: NestedEnvMap,
  separator = '__',
  prefix = ''
): EnvMap {
  const result: EnvMap = {};

  for (const [key, value] of Object.entries(nested)) {
    const fullKey = prefix ? `${prefix}${separator}${key}` : key;

    if (typeof value === 'object' && value !== null) {
      const child = flattenEnvMap(value as NestedEnvMap, separator, fullKey);
      Object.assign(result, child);
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Expands a flat env map into a nested structure using the separator.
 *
 * @example
 * expandEnvMap({ DB__HOST: 'localhost', DB__PORT: '5432' })
 * // => { DB: { HOST: 'localhost', PORT: '5432' } }
 */
export function expandEnvMap(
  flat: EnvMap,
  separator = '__'
): NestedEnvMap {
  const result: NestedEnvMap = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(separator);

    if (parts.length === 1) {
      result[key] = value;
      continue;
    }

    let current = result as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result as NestedEnvMap;
}

/**
 * Checks whether a flat env map contains any keys with the given separator,
 * indicating it could be expanded into a nested structure.
 */
export function hasNestedKeys(flat: EnvMap, separator = '__'): boolean {
  return Object.keys(flat).some((key) => key.includes(separator));
}
