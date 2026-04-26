export type UppercaseOptions = {
  keys?: boolean;
  values?: boolean;
};

export type UppercaseResult = {
  source: string;
  original: Record<string, string>;
  result: Record<string, string>;
  changedKeys: string[];
};

export function uppercaseEnvMap(
  source: string,
  env: Record<string, string>,
  options: UppercaseOptions = { keys: true, values: false }
): UppercaseResult {
  const result: Record<string, string> = {};
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = options.keys ? key.toUpperCase() : key;
    const newValue = options.values ? value.toUpperCase() : value;

    result[newKey] = newValue;

    if (newKey !== key || newValue !== value) {
      changedKeys.push(key);
    }
  }

  return { source, original: env, result, changedKeys };
}

export function uppercaseMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: UppercaseOptions = { keys: true, values: false }
): Record<string, UppercaseResult> {
  const results: Record<string, UppercaseResult> = {};

  for (const [source, env] of Object.entries(envMaps)) {
    results[source] = uppercaseEnvMap(source, env, options);
  }

  return results;
}

export function hasUppercaseChanges(result: UppercaseResult): boolean {
  return result.changedKeys.length > 0;
}
