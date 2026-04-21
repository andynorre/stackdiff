export type TokenType = 'string' | 'number' | 'boolean' | 'url' | 'path' | 'json' | 'empty' | 'unknown';

export interface Token {
  key: string;
  value: string;
  type: TokenType;
}

export type TokenizedEnvMap = Record<string, Token>;

const URL_RE = /^https?:\/\/.+/i;
const PATH_RE = /^(\/|\.\/|\.\.\/|[A-Za-z]:\\).*/;
const JSON_RE = /^(\{.*\}|\[.*\])$/s;
const INT_RE = /^-?\d+(\.\d+)?$/;
const BOOL_RE = /^(true|false)$/i;

export function detectType(value: string): TokenType {
  if (value === '') return 'empty';
  if (BOOL_RE.test(value)) return 'boolean';
  if (INT_RE.test(value)) return 'number';
  if (URL_RE.test(value)) return 'url';
  if (PATH_RE.test(value)) return 'path';
  try {
    if (JSON_RE.test(value)) {
      JSON.parse(value);
      return 'json';
    }
  } catch {
    // not valid json
  }
  if (typeof value === 'string') return 'string';
  return 'unknown';
}

export function tokenizeEnvMap(env: Record<string, string>): TokenizedEnvMap {
  const result: TokenizedEnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = { key, value, type: detectType(value) };
  }
  return result;
}

export function tokenizeMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>
): Record<string, TokenizedEnvMap> {
  const result: Record<string, TokenizedEnvMap> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    result[name] = tokenizeEnvMap(env);
  }
  return result;
}

export function groupByType(tokenized: TokenizedEnvMap): Record<TokenType, string[]> {
  const groups: Record<TokenType, string[]> = {
    string: [], number: [], boolean: [], url: [], path: [], json: [], empty: [], unknown: []
  };
  for (const { key, type } of Object.values(tokenized)) {
    groups[type].push(key);
  }
  return groups;
}
