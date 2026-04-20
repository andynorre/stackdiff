/**
 * Transform environment variable maps by applying key/value mutations.
 */

export type TransformFn = (key: string, value: string) => { key: string; value: string };

export interface TransformOptions {
  /** Convert all keys to uppercase */
  uppercaseKeys?: boolean;
  /** Convert all keys to lowercase */
  lowercaseKeys?: boolean;
  /** Add a prefix to all keys */
  addPrefix?: string;
  /** Remove a prefix from all keys */
  removePrefix?: string;
  /** Trim whitespace from all values */
  trimValues?: boolean;
  /** Apply a custom transform function */
  customTransform?: TransformFn;
}

export function transformEnvMap(
  envMap: Record<string, string>,
  options: TransformOptions
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(envMap)) {
    let key = rawKey;
    let value = rawValue;

    if (options.trimValues) {
      value = value.trim();
    }

    if (options.removePrefix && key.startsWith(options.removePrefix)) {
      key = key.slice(options.removePrefix.length);
    }

    if (options.addPrefix) {
      key = `${options.addPrefix}${key}`;
    }

    if (options.uppercaseKeys) {
      key = key.toUpperCase();
    } else if (options.lowercaseKeys) {
      key = key.toLowerCase();
    }

    if (options.customTransform) {
      ({ key, value } = options.customTransform(key, value));
    }

    result[key] = value;
  }

  return result;
}

export function transformMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: TransformOptions
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    result[name] = transformEnvMap(envMap, options);
  }
  return result;
}
