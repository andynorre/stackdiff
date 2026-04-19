import { Snapshot } from './snapshotManager';
import { diffEnvMaps, DiffResult } from '../diff/diffEngine';

export interface SnapshotComparison {
  baseLabel: string;
  headLabel: string;
  baseTimestamp: string;
  headTimestamp: string;
  diffs: Record<string, DiffResult>;
}

export function compareSnapshots(
  base: Snapshot,
  head: Snapshot
): SnapshotComparison {
  const allSources = new Set([
    ...Object.keys(base.envMaps),
    ...Object.keys(head.envMaps),
  ]);

  const diffs: Record<string, DiffResult> = {};

  for (const source of allSources) {
    const baseMap = base.envMaps[source] ?? {};
    const headMap = head.envMaps[source] ?? {};
    diffs[source] = diffEnvMaps(baseMap, headMap);
  }

  return {
    baseLabel: base.label,
    headLabel: head.label,
    baseTimestamp: base.timestamp,
    headTimestamp: head.timestamp,
    diffs,
  };
}

export function summariseComparison(comparison: SnapshotComparison): string {
  const lines: string[] = [
    `Comparing "${comparison.baseLabel}" → "${comparison.headLabel}"`,
    `Base: ${comparison.baseTimestamp}`,
    `Head: ${comparison.headTimestamp}`,
    '',
  ];

  for (const [source, diff] of Object.entries(comparison.diffs)) {
    const added = Object.keys(diff.added).length;
    const removed = Object.keys(diff.removed).length;
    const changed = Object.keys(diff.changed).length;
    lines.push(`  ${source}: +${added} -${removed} ~${changed}`);
  }

  return lines.join('\n');
}
