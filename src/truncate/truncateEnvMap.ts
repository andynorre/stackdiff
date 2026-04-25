export interface TruncateOptions {
  maxLength: number;
  suffix?: string;
  keysOnly?: boolean;
  valuesOnly?: boolean;
}

export interface TruncateResult {
  original: Record<string, string>;
  truncated: Record<string, string>;
  affectedKeys: string[];
}

const DEFAULT_SUFFIX = '...';

export function truncateValue(value: string, maxLength: number, suffix: string): string {
  if (value.length <= maxLength) return value;
  const cutAt = Math.max(0, maxLength - suffix.length);
  return value.slice(0, cutAt) + suffix;
}

export function truncateEnvMap(
  env: Record<string, string>,
  options: TruncateOptions
): TruncateResult {
  const { maxLength, suffix = DEFAULT_SUFFIX, keysOnly = false, valuesOnly = false } = options;
  const truncated: Record<string, string> = {};
  const affectedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = !valuesOnly ? truncateValue(key, maxLength, suffix) : key;
    const newValue = !keysOnly ? truncateValue(value, maxLength, suffix) : value;

    truncated[newKey] = newValue;

    if (newKey !== key || newValue !== value) {
      affectedKeys.push(key);
    }
  }

  return { original: env, truncated, affectedKeys };
}

export function truncateMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: TruncateOptions
): Record<string, TruncateResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [name, truncateEnvMap(env, options)])
  );
}

export function hasTruncateChanges(result: TruncateResult): boolean {
  return result.affectedKeys.length > 0;
}
