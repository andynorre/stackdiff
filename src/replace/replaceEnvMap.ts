export interface ReplaceOptions {
  pattern: string | RegExp;
  replacement: string;
  keysOnly?: boolean;
  valuesOnly?: boolean;
  caseSensitive?: boolean;
}

export interface ReplaceResult {
  original: Record<string, string>;
  replaced: Record<string, string>;
  changes: Array<{ key: string; field: 'key' | 'value'; from: string; to: string }>;
}

export function replaceInString(
  input: string,
  pattern: string | RegExp,
  replacement: string,
  caseSensitive = true
): string {
  if (typeof pattern === 'string') {
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return input.replace(new RegExp(escaped, flags), replacement);
  }
  return input.replace(pattern, replacement);
}

export function replaceEnvMap(
  env: Record<string, string>,
  options: ReplaceOptions
): ReplaceResult {
  const { pattern, replacement, keysOnly = false, valuesOnly = false, caseSensitive = true } = options;
  const replaced: Record<string, string> = {};
  const changes: ReplaceResult['changes'] = [];

  for (const [key, value] of Object.entries(env)) {
    let newKey = key;
    let newValue = value;

    if (!valuesOnly) {
      newKey = replaceInString(key, pattern, replacement, caseSensitive);
      if (newKey !== key) {
        changes.push({ key, field: 'key', from: key, to: newKey });
      }
    }

    if (!keysOnly) {
      newValue = replaceInString(value, pattern, replacement, caseSensitive);
      if (newValue !== value) {
        changes.push({ key, field: 'value', from: value, to: newValue });
      }
    }

    replaced[newKey] = newValue;
  }

  return { original: env, replaced, changes };
}

export function replaceMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: ReplaceOptions
): Record<string, ReplaceResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [name, replaceEnvMap(env, options)])
  );
}

export function hasReplaceChanges(result: ReplaceResult): boolean {
  return result.changes.length > 0;
}
