/**
 * Compute the intersection of multiple env maps:
 * keys that are present in ALL maps, with optional value-equality check.
 */

export interface IntersectOptions {
  /** If true, only include keys whose values are identical across all maps */
  matchValues?: boolean;
}

export interface IntersectResult {
  /** Keys present in every map (values taken from the first map) */
  keys: Record<string, string>;
  /** Keys that were excluded because values differed (only when matchValues=true) */
  valueMismatches: string[];
  /** Total keys considered */
  totalConsidered: number;
}

export function intersectEnvMaps(
  maps: Record<string, Record<string, string>>,
  options: IntersectOptions = {}
): IntersectResult {
  const names = Object.keys(maps);

  if (names.length === 0) {
    return { keys: {}, valueMismatches: [], totalConsidered: 0 };
  }

  const [firstName, ...restNames] = names;
  const first = maps[firstName];
  const candidateKeys = Object.keys(first);

  const resultKeys: Record<string, string> = {};
  const valueMismatches: string[] = [];

  for (const key of candidateKeys) {
    const presentInAll = restNames.every((name) => key in maps[name]);
    if (!presentInAll) continue;

    if (options.matchValues) {
      const baseValue = first[key];
      const allMatch = restNames.every((name) => maps[name][key] === baseValue);
      if (!allMatch) {
        valueMismatches.push(key);
        continue;
      }
    }

    resultKeys[key] = first[key];
  }

  return {
    keys: resultKeys,
    valueMismatches,
    totalConsidered: candidateKeys.length,
  };
}

export function hasIntersection(result: IntersectResult): boolean {
  return Object.keys(result.keys).length > 0;
}
