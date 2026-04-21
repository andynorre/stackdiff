import type { MaskOptions } from './maskEnvMap.js';

export type MaskSummary = {
  source: string;
  totalKeys: number;
  maskedKeys: string[];
};

export function formatMaskSummary(summary: MaskSummary): string {
  const lines: string[] = [];
  lines.push(`Source: ${summary.source}`);
  lines.push(`Total keys: ${summary.totalKeys}`);
  lines.push(`Masked keys (${summary.maskedKeys.length}): ${summary.maskedKeys.join(', ') || 'none'}`);
  return lines.join('\n');
}

export function formatMultipleMaskSummaries(summaries: MaskSummary[]): string {
  if (summaries.length === 0) return 'No sources processed.';
  return summaries.map(formatMaskSummary).join('\n\n');
}

export function formatMaskOptions(options: MaskOptions): string {
  const parts: string[] = [];
  if (options.char !== undefined) parts.push(`char='${options.char}'`);
  if (options.visibleStart !== undefined) parts.push(`visibleStart=${options.visibleStart}`);
  if (options.visibleEnd !== undefined) parts.push(`visibleEnd=${options.visibleEnd}`);
  if (options.minLength !== undefined) parts.push(`minLength=${options.minLength}`);
  return parts.length > 0 ? `Options: ${parts.join(', ')}` : 'Options: defaults';
}

export function countMaskedTotal(summaries: MaskSummary[]): number {
  return summaries.reduce((acc, s) => acc + s.maskedKeys.length, 0);
}
