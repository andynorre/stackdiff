import type { EnvMap } from '../parser/envParser';

export type ExportFormat = 'dotenv' | 'json' | 'yaml' | 'shell';

export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
  sortKeys?: boolean;
}

export interface ExportResult {
  content: string;
  format: ExportFormat;
  keyCount: number;
}

export function exportEnvMap(envMap: EnvMap, options: ExportOptions): ExportResult {
  const keys = options.sortKeys
    ? Object.keys(envMap).sort()
    : Object.keys(envMap);

  let content: string;

  switch (options.format) {
    case 'dotenv':
      content = formatDotenv(envMap, keys);
      break;
    case 'json':
      content = formatJson(envMap, keys);
      break;
    case 'yaml':
      content = formatYaml(envMap, keys);
      break;
    case 'shell':
      content = formatShell(envMap, keys);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  return { content, format: options.format, keyCount: keys.length };
}

function formatDotenv(envMap: EnvMap, keys: string[]): string {
  return keys.map(k => `${k}=${quoteIfNeeded(envMap[k])}`).join('\n') + '\n';
}

function formatJson(envMap: EnvMap, keys: string[]): string {
  const obj = Object.fromEntries(keys.map(k => [k, envMap[k]]));
  return JSON.stringify(obj, null, 2) + '\n';
}

function formatYaml(envMap: EnvMap, keys: string[]): string {
  return keys.map(k => `${k}: "${envMap[k].replace(/"/g, '\\"')}"`).join('\n') + '\n';
}

function formatShell(envMap: EnvMap, keys: string[]): string {
  return keys.map(k => `export ${k}=${quoteIfNeeded(envMap[k])}`).join('\n') + '\n';
}

function quoteIfNeeded(value: string): string {
  return /\s|#|"/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

export function exportMultipleEnvMaps(
  envMaps: Record<string, EnvMap>,
  options: ExportOptions
): Record<string, ExportResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, map]) => [name, exportEnvMap(map, options)])
  );
}
