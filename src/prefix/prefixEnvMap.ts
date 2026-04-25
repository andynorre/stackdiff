export interface PrefixOptions {
  prefix: string;
  separator?: string;
  overwrite?: boolean;
}

export interface PrefixResult {
  source: Record<string, string>;
  result: Record<string, string>;
  added: string[];
  skipped: string[];
}

export function prefixEnvMap(
  env: Record<string, string>,
  options: PrefixOptions
): PrefixResult {
  const { prefix, separator = '_', overwrite = false } = options;
  const result: Record<string, string> = {};
  const added: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = `${prefix}${separator}${key}`;
    if (!overwrite && newKey in env) {
      skipped.push(key);
      result[key] = value;
    } else {
      result[newKey] = value;
      added.push(newKey);
    }
  }

  return { source: env, result, added, skipped };
}

export function prefixMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: PrefixOptions
): Record<string, PrefixResult> {
  const results: Record<string, PrefixResult> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    results[name] = prefixEnvMap(env, options);
  }
  return results;
}

export function hasPrefixChanges(result: PrefixResult): boolean {
  return result.added.length > 0;
}

export function stripPrefix(
  env: Record<string, string>,
  prefix: string,
  separator = '_'
): Record<string, string> {
  const full = `${prefix}${separator}`;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(full)) {
      result[key.slice(full.length)] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}
