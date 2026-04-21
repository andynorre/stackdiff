import type { PatchOperation, PatchResult } from './patchEnvMap';

function describeOperation(op: PatchOperation): string {
  if (op.op === 'set') return `SET ${op.key}=${op.value}`;
  if (op.op === 'unset') return `UNSET ${op.key}`;
  if (op.op === 'rename') return `RENAME ${op.from} -> ${op.to}`;
  return 'UNKNOWN';
}

export function formatPatchResult(result: PatchResult, label?: string): string {
  const lines: string[] = [];

  if (label) lines.push(`Patch result for: ${label}`);

  if (result.applied.length === 0 && result.skipped.length === 0) {
    lines.push('  No operations to apply.');
    return lines.join('\n');
  }

  if (result.applied.length > 0) {
    lines.push(`  Applied (${result.applied.length}):`);
    for (const op of result.applied) {
      lines.push(`    ✔ ${describeOperation(op)}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`  Skipped (${result.skipped.length}):`);
    for (const { operation, reason } of result.skipped) {
      lines.push(`    ✘ ${describeOperation(operation)} — ${reason}`);
    }
  }

  return lines.join('\n');
}

export function formatMultiplePatchResults(
  results: Record<string, PatchResult>
): string {
  return Object.entries(results)
    .map(([name, result]) => formatPatchResult(result, name))
    .join('\n\n');
}

export function countPatchStats(result: PatchResult): {
  applied: number;
  skipped: number;
  total: number;
} {
  return {
    applied: result.applied.length,
    skipped: result.skipped.length,
    total: result.applied.length + result.skipped.length,
  };
}
