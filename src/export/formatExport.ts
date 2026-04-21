import type { ExportResult, ExportFormat } from './exportEnvMap';

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  dotenv: '.env',
  json: '.json',
  yaml: '.yaml',
  shell: '.sh',
};

export function suggestFilename(name: string, format: ExportFormat): string {
  const ext = FORMAT_EXTENSIONS[format];
  if (format === 'dotenv') {
    return `.env.${name}`;
  }
  return `${name}${ext}`;
}

export function formatExportSummary(results: Record<string, ExportResult>): string {
  const lines: string[] = ['Export Summary', '=============='];

  for (const [name, result] of Object.entries(results)) {
    lines.push(`  ${name}: ${result.keyCount} keys (${result.format})`);
  }

  const totalKeys = Object.values(results).reduce((sum, r) => sum + r.keyCount, 0);
  lines.push('');
  lines.push(`Total: ${Object.keys(results).length} file(s), ${totalKeys} key(s) exported`);

  return lines.join('\n');
}

export function formatSingleExportSummary(name: string, result: ExportResult): string {
  return [
    `Exported: ${name}`,
    `Format:   ${result.format}`,
    `Keys:     ${result.keyCount}`,
    `File:     ${suggestFilename(name, result.format)}`,
  ].join('\n');
}
