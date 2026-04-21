/**
 * Pivot multiple env maps into a key-centric view:
 * { KEY: { source1: value, source2: value, ... } }
 */

export type EnvMap = Record<string, string>;

export interface PivotRow {
  key: string;
  sources: Record<string, string | undefined>;
}

export interface PivotResult {
  sources: string[];
  rows: PivotRow[];
}

/**
 * Pivot a set of named env maps so each row represents one key
 * and columns represent each source's value (or undefined if absent).
 */
export function pivotEnvMaps(maps: Record<string, EnvMap>): PivotResult {
  const sources = Object.keys(maps);
  const allKeys = new Set<string>();

  for (const map of Object.values(maps)) {
    for (const key of Object.keys(map)) {
      allKeys.add(key);
    }
  }

  const rows: PivotRow[] = Array.from(allKeys)
    .sort()
    .map((key) => {
      const sources: Record<string, string | undefined> = {};
      for (const [source, map] of Object.entries(maps)) {
        sources[source] = map[key];
      }
      return { key, sources };
    });

  return { sources, rows };
}

/**
 * Returns only the rows where values differ across sources.
 */
export function pivotDiffOnly(result: PivotResult): PivotResult {
  const rows = result.rows.filter((row) => {
    const values = Object.values(row.sources);
    const first = values[0];
    return values.some((v) => v !== first);
  });
  return { sources: result.sources, rows };
}

/**
 * Returns only rows where at least one source is missing the key.
 */
export function pivotMissingOnly(result: PivotResult): PivotResult {
  const rows = result.rows.filter((row) =>
    Object.values(row.sources).some((v) => v === undefined)
  );
  return { sources: result.sources, rows };
}
