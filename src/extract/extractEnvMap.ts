/**
 * Extract a subset of keys from one or more env maps by pattern or explicit list.
 */

export type ExtractOptions = {
  keys?: string[];
  pattern?: RegExp;
  ignoreCase?: boolean;
};

export type ExtractResult = {
  source: string;
  extracted: Record<string, string>;
  matched: string[];
  total: number;
};

export function extractEnvMap(
  source: string,
  envMap: Record<string, string>,
  options: ExtractOptions
): ExtractResult {
  const { keys = [], pattern, ignoreCase = false } = options;

  const extracted: Record<string, string> = {};
  const matched: string[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    const compareKey = ignoreCase ? key.toLowerCase() : key;

    const matchedByKey = keys.some((k) =>
      ignoreCase ? k.toLowerCase() === compareKey : k === key
    );

    const matchedByPattern = pattern
      ? pattern.test(ignoreCase ? key.toLowerCase() : key)
      : false;

    if (matchedByKey || matchedByPattern) {
      extracted[key] = value;
      matched.push(key);
    }
  }

  return {
    source,
    extracted,
    matched,
    total: matched.length,
  };
}

export function extractMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: ExtractOptions
): ExtractResult[] {
  return Object.entries(envMaps).map(([source, envMap]) =>
    extractEnvMap(source, envMap, options)
  );
}

export function hasExtractMatches(result: ExtractResult): boolean {
  return result.total > 0;
}
