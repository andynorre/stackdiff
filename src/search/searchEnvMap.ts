export interface SearchOptions {
  caseSensitive?: boolean;
  searchValues?: boolean;
  searchKeys?: boolean;
  regex?: boolean;
}

export interface SearchMatch {
  key: string;
  value: string;
  matchedOn: 'key' | 'value' | 'both';
}

export interface SearchResult {
  source: string;
  query: string;
  matches: SearchMatch[];
  totalKeys: number;
}

export function searchEnvMap(
  envMap: Record<string, string>,
  query: string,
  source: string,
  options: SearchOptions = {}
): SearchResult {
  const {
    caseSensitive = false,
    searchValues = true,
    searchKeys = true,
    regex = false,
  } = options;

  const matches: SearchMatch[] = [];

  let pattern: RegExp;
  try {
    const flags = caseSensitive ? '' : 'i';
    pattern = regex ? new RegExp(query, flags) : new RegExp(escapeRegex(query), flags);
  } catch {
    pattern = new RegExp(escapeRegex(query), caseSensitive ? '' : 'i');
  }

  for (const [key, value] of Object.entries(envMap)) {
    const keyMatches = searchKeys && pattern.test(key);
    const valueMatches = searchValues && pattern.test(value);

    if (keyMatches && valueMatches) {
      matches.push({ key, value, matchedOn: 'both' });
    } else if (keyMatches) {
      matches.push({ key, value, matchedOn: 'key' });
    } else if (valueMatches) {
      matches.push({ key, value, matchedOn: 'value' });
    }
  }

  return { source, query, matches, totalKeys: Object.keys(envMap).length };
}

export function searchMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  return Object.entries(envMaps).map(([source, envMap]) =>
    searchEnvMap(envMap, query, source, options)
  );
}

export function hasSearchMatches(result: SearchResult): boolean {
  return result.matches.length > 0;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
