/**
 * Formatting utilities for uppercase transformation results.
 * Provides human-readable summaries of uppercased env maps.
 */

import type { EnvMap } from '../parser';

export interface UppercaseStats {
  total: number;
  changed: number;
  unchanged: number;
}

/**
 * Collect statistics about an uppercase transformation.
 */
export function collectUppercaseStats(
  original: EnvMap,
  result: EnvMap
): UppercaseStats {
  const total = Object.keys(result).length;
  let changed = 0;

  for (const key of Object.keys(result)) {
    const originalValue = original[key];
    const resultValue = result[key];
    if (originalValue !== resultValue) {
      changed++;
    }
  }

  return {
    total,
    changed,
    unchanged: total - changed,
  };
}

/**
 * Format a single uppercase result into a readable summary string.
 */
export function formatUppercaseResult(
  original: EnvMap,
  result: EnvMap,
  label?: string
): string {
  const stats = collectUppercaseStats(original, result);
  const header = label ? `[${label}]\n` : '';
  const lines: string[] = [];

  for (const key of Object.keys(result)) {
    const originalValue = original[key];
    const resultValue = result[key];
    if (originalValue !== resultValue) {
      lines.push(`  ~ ${key}: "${originalValue}" → "${resultValue}"`);
    }
  }

  const summary =
    `${header}Uppercase transformation: ${stats.changed} value(s) changed, ` +
    `${stats.unchanged} already uppercase (${stats.total} total)`;

  return lines.length > 0 ? `${summary}\n${lines.join('\n')}` : summary;
}

/**
 * Format multiple uppercase results into a combined summary string.
 */
export function formatMultipleUppercaseResults(
  originals: Record<string, EnvMap>,
  results: Record<string, EnvMap>
): string {
  const sections: string[] = [];

  for (const label of Object.keys(results)) {
    const original = originals[label] ?? {};
    const result = results[label];
    sections.push(formatUppercaseResult(original, result, label));
  }

  return sections.join('\n\n');
}

/**
 * Count the total number of values uppercased across multiple env maps.
 */
export function countUppercasedTotal(
  originals: Record<string, EnvMap>,
  results: Record<string, EnvMap>
): number {
  let total = 0;

  for (const label of Object.keys(results)) {
    const original = originals[label] ?? {};
    const stats = collectUppercaseStats(original, results[label]);
    total += stats.changed;
  }

  return total;
}
