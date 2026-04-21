/**
 * patchEnvMap — apply a set of patch operations to an env map.
 * Supports set, unset, and rename operations in a single pass.
 */

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'unset'; key: string }
  | { op: 'rename'; from: string; to: string };

export interface PatchResult {
  original: Record<string, string>;
  patched: Record<string, string>;
  applied: PatchOperation[];
  skipped: Array<{ operation: PatchOperation; reason: string }>;
}

export function patchEnvMap(
  envMap: Record<string, string>,
  operations: PatchOperation[]
): PatchResult {
  const patched: Record<string, string> = { ...envMap };
  const applied: PatchOperation[] = [];
  const skipped: Array<{ operation: PatchOperation; reason: string }> = [];

  for (const operation of operations) {
    if (operation.op === 'set') {
      patched[operation.key] = operation.value;
      applied.push(operation);
    } else if (operation.op === 'unset') {
      if (!(operation.key in patched)) {
        skipped.push({ operation, reason: `key "${operation.key}" does not exist` });
      } else {
        delete patched[operation.key];
        applied.push(operation);
      }
    } else if (operation.op === 'rename') {
      if (!(operation.from in patched)) {
        skipped.push({ operation, reason: `key "${operation.from}" does not exist` });
      } else if (operation.to in patched) {
        skipped.push({ operation, reason: `target key "${operation.to}" already exists` });
      } else {
        patched[operation.to] = patched[operation.from];
        delete patched[operation.from];
        applied.push(operation);
      }
    }
  }

  return { original: envMap, patched, applied, skipped };
}

export function patchMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  operations: PatchOperation[]
): Record<string, PatchResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, map]) => [name, patchEnvMap(map, operations)])
  );
}
