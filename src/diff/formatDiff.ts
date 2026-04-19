import type { DiffResult } from './diffEngine';

export type OutputFormat = 'text' | 'json';

export function formatDiff(
  result: DiffResult,
  labelA: string,
  labelB: string,
  format: OutputFormat = 'text'
): string {
  if (format === 'json') {
    return JSON.stringify({ labelA, labelB, ...result }, null, 2);
  }

  const lines: string[] = [];

  lines.push(`Comparing: ${labelA}  vs  ${labelB}`);
  lines.push('');

  if (result.onlyInA.length > 0) {
    lines.push(`Only in ${labelA} (${result.onlyInA.length}):`);
    for (const key of result.onlyInA) {
      lines.push(`  - ${key}`);
    }
    lines.push('');
  }

  if (result.onlyInB.length > 0) {
    lines.push(`Only in ${labelB} (${result.onlyInB.length}):`);
    for (const key of result.onlyInB) {
      lines.push(`  + ${key}`);
    }
    lines.push('');
  }

  if (result.changed.length > 0) {
    lines.push(`Changed values (${result.changed.length}):`);
    for (const { key, valueA, valueB } of result.changed) {
      lines.push(`  ~ ${key}`);
      lines.push(`      ${labelA}: ${valueA}`);
      lines.push(`      ${labelB}: ${valueB}`);
    }
    lines.push('');
  }

  if (result.identical.length > 0) {
    lines.push(`Identical keys: ${result.identical.length}`);
  }

  return lines.join('\n');
}
