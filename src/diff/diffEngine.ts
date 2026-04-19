export type EnvMap = Record<string, string>;

export interface DiffResult {
  onlyInA: string[];
  onlyInB: string[];
  changed: { key: string; valueA: string; valueB: string }[];
  identical: string[];
}

export function diffEnvMaps(a: EnvMap, b: EnvMap): DiffResult {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const onlyInA: string[] = [];
  const onlyInB: string[] = [];
  const changed: DiffResult['changed'] = [];
  const identical: string[] = [];

  for (const key of keysA) {
    if (!keysB.has(key)) {
      onlyInA.push(key);
    } else if (a[key] !== b[key]) {
      changed.push({ key, valueA: a[key], valueB: b[key] });
    } else {
      identical.push(key);
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      onlyInB.push(key);
    }
  }

  return {
    onlyInA: onlyInA.sort(),
    onlyInB: onlyInB.sort(),
    changed: changed.sort((x, y) => x.key.localeCompare(y.key)),
    identical: identical.sort(),
  };
}

export function hasDifferences(result: DiffResult): boolean {
  return (
    result.onlyInA.length > 0 ||
    result.onlyInB.length > 0 ||
    result.changed.length > 0
  );
}
