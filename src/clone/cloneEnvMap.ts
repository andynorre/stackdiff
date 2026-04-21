/**
 * Clone and deep-copy environment maps with optional key/value transformations.
 */

export type CloneOptions = {
  prefix?: string;
  suffix?: string;
  overrides?: Record<string, string>;
  omitKeys?: string[];
};

export type CloneResult = {
  source: Record<string, string>;
  cloned: Record<string, string>;
  omitted: string[];
  overridden: string[];
};

export function cloneEnvMap(
  source: Record<string, string>,
  options: CloneOptions = {}
): CloneResult {
  const { prefix = '', suffix = '', overrides = {}, omitKeys = [] } = options;
  const omitSet = new Set(omitKeys);
  const cloned: Record<string, string> = {};
  const omitted: string[] = [];
  const overridden: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (omitSet.has(key)) {
      omitted.push(key);
      continue;
    }
    const newKey = `${prefix}${key}${suffix}`;
    const newValue = key in overrides ? overrides[key] : value;
    if (key in overrides) overridden.push(key);
    cloned[newKey] = newValue;
  }

  return { source: { ...source }, cloned, omitted, overridden };
}

export function cloneMultipleEnvMaps(
  maps: Record<string, Record<string, string>>,
  options: CloneOptions = {}
): Record<string, CloneResult> {
  return Object.fromEntries(
    Object.entries(maps).map(([name, map]) => [name, cloneEnvMap(map, options)])
  );
}

export function hasCloneChanges(result: CloneResult): boolean {
  return result.omitted.length > 0 || result.overridden.length > 0;
}
