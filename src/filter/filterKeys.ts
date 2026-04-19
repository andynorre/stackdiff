/**
 * Filter and mask environment variable maps before diffing or display.
 */

export type FilterOptions = {
  include?: string[];
  exclude?: string[];
  maskSecrets?: boolean;
};

const SECRET_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api_key/i,
  /private/i,
  /credential/i,
];

export function isSecret(key: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(key));
}

export function maskValue(value: string): string {
  if (value.length <= 4) return "****";
  return value.slice(0, 2) + "****" + value.slice(-2);
}

export function filterEnvMap(
  envMap: Record<string, string>,
  options: FilterOptions = {}
): Record<string, string> {
  const { include, exclude, maskSecrets = false } = options;

  let entries = Object.entries(envMap);

  if (include && include.length > 0) {
    entries = entries.filter(([key]) => include.includes(key));
  }

  if (exclude && exclude.length > 0) {
    entries = entries.filter(([key]) => !exclude.includes(key));
  }

  return Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      maskSecrets && isSecret(key) ? maskValue(value) : value,
    ])
  );
}

export function filterMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: FilterOptions = {}
): Record<string, Record<string, string>> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, map]) => [
      name,
      filterEnvMap(map, options),
    ])
  );
}
