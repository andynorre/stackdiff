/**
 * Scope filtering: restrict or extract env keys by prefix scope.
 * e.g. scope "DB" matches DB_HOST, DB_PORT, etc.
 */

export interface ScopeOptions {
  /** Strip the scope prefix from resulting keys */
  stripPrefix?: boolean;
  /** Case-insensitive scope matching */
  caseInsensitive?: boolean;
}

export interface ScopeResult {
  scope: string;
  matched: Record<string, string>;
  excluded: Record<string, string>;
  matchCount: number;
  excludedCount: number;
}

export function scopeEnvMap(
  env: Record<string, string>,
  scope: string,
  options: ScopeOptions = {}
): ScopeResult {
  const { stripPrefix = false, caseInsensitive = false } = options;
  const prefix = scope.endsWith('_') ? scope : `${scope}_`;
  const normalise = (s: string) => (caseInsensitive ? s.toUpperCase() : s);
  const normPrefix = normalise(prefix);

  const matched: Record<string, string> = {};
  const excluded: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (normalise(key).startsWith(normPrefix)) {
      const outKey = stripPrefix ? key.slice(prefix.length) : key;
      matched[outKey] = value;
    } else {
      excluded[key] = value;
    }
  }

  return {
    scope,
    matched,
    excluded,
    matchCount: Object.keys(matched).length,
    excludedCount: Object.keys(excluded).length,
  };
}

export function scopeMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  scope: string,
  options: ScopeOptions = {}
): Record<string, ScopeResult> {
  const results: Record<string, ScopeResult> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    results[name] = scopeEnvMap(env, scope, options);
  }
  return results;
}

export function listScopes(env: Record<string, string>): string[] {
  const scopes = new Set<string>();
  for (const key of Object.keys(env)) {
    const parts = key.split('_');
    if (parts.length > 1) {
      scopes.add(parts[0]);
    }
  }
  return Array.from(scopes).sort();
}
