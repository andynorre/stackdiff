/**
 * Trim whitespace and optional quote characters from env map values.
 */

export type TrimOptions = {
  trimKeys?: boolean;
  trimValues?: boolean;
  stripQuotes?: boolean;
};

const DEFAULT_OPTIONS: Required<TrimOptions> = {
  trimKeys: false,
  trimValues: true,
  stripQuotes: true,
};

const QUOTE_CHARS = ['"', "'", '`'];

export function stripSurroundingQuotes(value: string): string {
  for (const q of QUOTE_CHARS) {
    if (value.startsWith(q) && value.endsWith(q) && value.length >= 2) {
      return value.slice(1, -1);
    }
  }
  return value;
}

export function trimEnvMap(
  envMap: Record<string, string>,
  options: TrimOptions = {}
): Record<string, string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(envMap)) {
    const key = opts.trimKeys ? rawKey.trim() : rawKey;
    let value = opts.trimValues ? rawValue.trim() : rawValue;
    if (opts.stripQuotes) {
      value = stripSurroundingQuotes(value);
    }
    result[key] = value;
  }

  return result;
}

export function trimMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: TrimOptions = {}
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    result[name] = trimEnvMap(envMap, options);
  }
  return result;
}

export function hasTrimChanges(
  original: Record<string, string>,
  trimmed: Record<string, string>
): boolean {
  return Object.keys(original).some((k) => original[k] !== trimmed[k]);
}
