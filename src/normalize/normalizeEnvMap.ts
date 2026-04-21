export type NormalizeOptions = {
  uppercaseKeys?: boolean;
  lowercaseValues?: boolean;
  trimValues?: boolean;
  removeEmpty?: boolean;
  collapseWhitespace?: boolean;
};

export type NormalizeResult = {
  source: string;
  original: Record<string, string>;
  normalized: Record<string, string>;
  changes: Array<{ key: string; from: string; to: string; reason: string }>;
};

export function normalizeEnvMap(
  source: string,
  env: Record<string, string>,
  options: NormalizeOptions = {}
): NormalizeResult {
  const {
    uppercaseKeys = false,
    lowercaseValues = false,
    trimValues = true,
    removeEmpty = false,
    collapseWhitespace = false,
  } = options;

  const normalized: Record<string, string> = {};
  const changes: NormalizeResult["changes"] = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    let key = rawKey;
    let value = rawValue;

    if (uppercaseKeys && key !== key.toUpperCase()) {
      key = key.toUpperCase();
    }

    if (trimValues && value !== value.trim()) {
      changes.push({ key, from: value, to: value.trim(), reason: "trimmed whitespace" });
      value = value.trim();
    }

    if (collapseWhitespace) {
      const collapsed = value.replace(/\s+/g, " ");
      if (collapsed !== value) {
        changes.push({ key, from: value, to: collapsed, reason: "collapsed whitespace" });
        value = collapsed;
      }
    }

    if (lowercaseValues && value !== value.toLowerCase()) {
      changes.push({ key, from: value, to: value.toLowerCase(), reason: "lowercased value" });
      value = value.toLowerCase();
    }

    if (removeEmpty && value === "") {
      changes.push({ key, from: value, to: "(removed)", reason: "empty value removed" });
      continue;
    }

    normalized[key] = value;
  }

  return { source, original: env, normalized, changes };
}

export function normalizeMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: NormalizeOptions = {}
): NormalizeResult[] {
  return Object.entries(envMaps).map(([source, env]) =>
    normalizeEnvMap(source, env, options)
  );
}

export function hasNormalizeChanges(result: NormalizeResult): boolean {
  return result.changes.length > 0;
}
