/**
 * Promotes env vars from a source environment to a target environment,
 * optionally overwriting existing keys or only filling missing ones.
 */

export type PromoteMode = 'overwrite' | 'fill-missing' | 'dry-run';

export interface PromoteOptions {
  mode?: PromoteMode;
  keys?: string[]; // if provided, only promote these keys
}

export interface PromoteResult {
  promoted: Record<string, { from: string | undefined; to: string }>;
  skipped: Record<string, { reason: string; value: string }>;
  source: string;
  target: string;
  mode: PromoteMode;
}

export function promoteEnvMap(
  source: Record<string, string>,
  target: Record<string, string>,
  sourceLabel: string,
  targetLabel: string,
  options: PromoteOptions = {}
): PromoteResult {
  const mode: PromoteMode = options.mode ?? 'fill-missing';
  const keysToPromote = options.keys ?? Object.keys(source);

  const promoted: PromoteResult['promoted'] = {};
  const skipped: PromoteResult['skipped'] = {};
  const resultTarget = { ...target };

  for (const key of keysToPromote) {
    if (!(key in source)) {
      skipped[key] = { reason: 'not found in source', value: '' };
      continue;
    }

    const sourceValue = source[key];
    const targetValue = target[key];

    if (mode === 'fill-missing' && key in target) {
      skipped[key] = { reason: 'already exists in target', value: targetValue };
      continue;
    }

    if (mode === 'dry-run') {
      promoted[key] = { from: targetValue, to: sourceValue };
      continue;
    }

    promoted[key] = { from: targetValue, to: sourceValue };
    resultTarget[key] = sourceValue;
  }

  return { promoted, skipped, source: sourceLabel, target: targetLabel, mode };
}

export function promoteMultipleEnvMaps(
  source: Record<string, string>,
  targets: Record<string, Record<string, string>>,
  sourceLabel: string,
  options: PromoteOptions = {}
): Record<string, PromoteResult> {
  return Object.fromEntries(
    Object.entries(targets).map(([label, target]) => [
      label,
      promoteEnvMap(source, target, sourceLabel, label, options),
    ])
  );
}

export function hasPromoteChanges(result: PromoteResult): boolean {
  return Object.keys(result.promoted).length > 0;
}
