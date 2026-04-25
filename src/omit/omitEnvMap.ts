export type OmitOptions = {
  keys: string[];
  ignoreCase?: boolean;
};

export type OmitResult = {
  source: Record<string, string>;
  result: Record<string, string>;
  omitted: string[];
  retained: string[];
};

export function omitEnvMap(
  env: Record<string, string>,
  options: OmitOptions
): OmitResult {
  const { keys, ignoreCase = false } = options;

  const normalise = (k: string) => (ignoreCase ? k.toLowerCase() : k);
  const omitSet = new Set(keys.map(normalise));

  const result: Record<string, string> = {};
  const omitted: string[] = [];
  const retained: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (omitSet.has(normalise(key))) {
      omitted.push(key);
    } else {
      result[key] = value;
      retained.push(key);
    }
  }

  return { source: env, result, omitted, retained };
}

export function omitMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: OmitOptions
): Record<string, OmitResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [
      name,
      omitEnvMap(env, options),
    ])
  );
}

export function hasOmitChanges(result: OmitResult): boolean {
  return result.omitted.length > 0;
}
