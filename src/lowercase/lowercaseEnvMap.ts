/**
 * Lowercase environment variable values (not keys).
 * Keys remain unchanged; only values are lowercased.
 */

export interface LowercaseOptions {
  /** If true, also lowercase the keys themselves */
  lowercaseKeys?: boolean;
}

export interface LowercaseResult {
  source: string;
  original: Record<string, string>;
  lowercased: Record<string, string>;
  changedKeys: string[];
}

export function lowercaseEnvMap(
  source: string,
  env: Record<string, string>,
  options: LowercaseOptions = {}
): LowercaseResult {
  const { lowercaseKeys = false } = options;
  const lowercased: Record<string, string> = {};
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = lowercaseKeys ? key.toLowerCase() : key;
    const newValue = value.toLowerCase();

    lowercased[newKey] = newValue;

    if (newValue !== value || newKey !== key) {
      changedKeys.push(key);
    }
  }

  return { source, original: env, lowercased, changedKeys };
}

export function lowercaseMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: LowercaseOptions = {}
): LowercaseResult[] {
  return Object.entries(envMaps).map(([source, env]) =>
    lowercaseEnvMap(source, env, options)
  );
}

export function hasLowercaseChanges(result: LowercaseResult): boolean {
  return result.changedKeys.length > 0;
}
