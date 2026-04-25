export interface CountResult {
  total: number;
  empty: number;
  nonEmpty: number;
  byPrefix: Record<string, number>;
}

export interface MultipleCountResult {
  sources: Record<string, CountResult>;
  totals: CountResult;
}

export function countEnvMap(env: Record<string, string>): CountResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const empty = keys.filter((k) => env[k] === '').length;
  const nonEmpty = total - empty;

  const byPrefix: Record<string, number> = {};
  for (const key of keys) {
    const underscoreIndex = key.indexOf('_');
    const prefix = underscoreIndex > 0 ? key.slice(0, underscoreIndex) : '__none__';
    byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
  }

  return { total, empty, nonEmpty, byPrefix };
}

export function countMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>
): MultipleCountResult {
  const sources: Record<string, CountResult> = {};
  const combinedByPrefix: Record<string, number> = {};
  let totalTotal = 0;
  let totalEmpty = 0;
  let totalNonEmpty = 0;

  for (const [name, env] of Object.entries(envMaps)) {
    const result = countEnvMap(env);
    sources[name] = result;
    totalTotal += result.total;
    totalEmpty += result.empty;
    totalNonEmpty += result.nonEmpty;
    for (const [prefix, count] of Object.entries(result.byPrefix)) {
      combinedByPrefix[prefix] = (combinedByPrefix[prefix] ?? 0) + count;
    }
  }

  return {
    sources,
    totals: {
      total: totalTotal,
      empty: totalEmpty,
      nonEmpty: totalNonEmpty,
      byPrefix: combinedByPrefix,
    },
  };
}

export function hasCounts(result: CountResult): boolean {
  return result.total > 0;
}
