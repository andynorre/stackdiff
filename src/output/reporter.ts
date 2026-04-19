import { DiffResult } from '../diff/diffEngine';
import { formatDiff } from '../diff/formatDiff';
import * as fs from 'fs';
import * as path from 'path';

export type OutputFormat = 'text' | 'json' | 'markdown';

export interface ReportOptions {
  format: OutputFormat;
  outputFile?: string;
  color?: boolean;
}

export function generateReport(
  diffs: Record<string, DiffResult>,
  options: ReportOptions
): string {
  let output: string;

  switch (options.format) {
    case 'json':
      output = JSON.stringify(diffs, null, 2);
      break;
    case 'markdown':
      output = generateMarkdown(diffs);
      break;
    case 'text':
    default:
      output = Object.entries(diffs)
        .map(([label, diff]) => `=== ${label} ===\n${formatDiff(diff, options.color ?? true)}`)
        .join('\n\n');
  }

  return output;
}

export function writeReport(content: string, outputFile: string): void {
  const dir = path.dirname(outputFile);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputFile, content, 'utf-8');
}

function generateMarkdown(diffs: Record<string, DiffResult>): string {
  const lines: string[] = ['# StackDiff Report', ''];

  for (const [label, diff] of Object.entries(diffs)) {
    lines.push(`## ${label}`, '');

    if (diff.added.length > 0) {
      lines.push('### Added', ...diff.added.map(k => `- \`${k}\``), '');
    }
    if (diff.removed.length > 0) {
      lines.push('### Removed', ...diff.removed.map(k => `- \`${k}\``), '');
    }
    if (diff.changed.length > 0) {
      lines.push('### Changed', ...diff.changed.map(k => `- \`${k}\``), '');
    }
    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
      lines.push('_No differences found._', '');
    }
  }

  return lines.join('\n');
}
