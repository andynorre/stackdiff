import type { EnvMap } from '../parser/envParser';

export type CompareMode = 'symmetric' | 'left' | 'right';

export interface CompareResult {
  onlyInLeft: string[];
  onlyInRight: string[];
  inBoth: string[];
  differing: string[];
  matching: string[];
}

/**
 * Compare two EnvMaps and return a structured result describing key relationships.
 */
export function compareEnvMaps(
  left: EnvMap,
  right: EnvMap,
  mode: CompareMode = 'symmetric'
): CompareResult {
  const leftKeys = new Set(Object.keys(left));
  const rightKeys = new Set(Object.keys(right));

  const onlyInLeft: string[] = [];
  const onlyInRight: string[] = [];
  const inBoth: string[] = [];
  const differing: string[] = [];
  const matching: string[] = [];

  for (const key of leftKeys) {
    if (!rightKeys.has(key)) {
      onlyInLeft.push(key);
    } else {
      inBoth.push(key);
      if (left[key] === right[key]) {
        matching.push(key);
      } else {
        differing.push(key);
      }
    }
  }

  if (mode === 'symmetric' || mode === 'right') {
    for (const key of rightKeys) {
      if (!leftKeys.has(key)) {
        onlyInRight.push(key);
      }
    }
  }

  return {
    onlyInLeft: onlyInLeft.sort(),
    onlyInRight: onlyInRight.sort(),
    inBoth: inBoth.sort(),
    differing: differing.sort(),
    matching: matching.sort(),
  };
}

/**
 * Returns true if there are any differences between the two maps.
 */
export function hasCompareDifferences(result: CompareResult): boolean {
  return (
    result.onlyInLeft.length > 0 ||
    result.onlyInRight.length > 0 ||
    result.differing.length > 0
  );
}

/**
 * Summarise a compare result as a human-readable string.
 */
export function summariseCompare(result: CompareResult): string {
  const lines: string[] = [];
  lines.push(`Matching keys   : ${result.matching.length}`);
  lines.push(`Differing values: ${result.differing.length}`);
  lines.push(`Only in left    : ${result.onlyInLeft.length}`);
  lines.push(`Only in right   : ${result.onlyInRight.length}`);
  return lines.join('\n');
}
