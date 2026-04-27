export type CoerceType = 'string' | 'number' | 'boolean' | 'json';

export interface CoerceRule {
  type: CoerceType;
  fallback?: string;
}

export type CoerceRules = Record<string, CoerceRule>;

export interface CoerceResult {
  coerced: Record<string, string>;
  changed: string[];
  failed: string[];
}

function coerceValue(key: string, value: string, rule: CoerceRule): { value: string; ok: boolean } {
  try {
    switch (rule.type) {
      case 'boolean': {
        const lower = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(lower)) return { value: 'true', ok: true };
        if (['false', '0', 'no', 'off'].includes(lower)) return { value: 'false', ok: true };
        if (rule.fallback !== undefined) return { value: rule.fallback, ok: false };
        return { value, ok: false };
      }
      case 'number': {
        const num = Number(value.trim());
        if (!isNaN(num)) return { value: String(num), ok: true };
        if (rule.fallback !== undefined) return { value: rule.fallback, ok: false };
        return { value, ok: false };
      }
      case 'json': {
        JSON.parse(value);
        return { value, ok: true };
      }
      case 'string':
      default:
        return { value: String(value), ok: true };
    }
  } catch {
    if (rule.fallback !== undefined) return { value: rule.fallback, ok: false };
    return { value, ok: false };
  }
}

export function coerceEnvMap(
  env: Record<string, string>,
  rules: CoerceRules
): CoerceResult {
  const coerced: Record<string, string> = { ...env };
  const changed: string[] = [];
  const failed: string[] = [];

  for (const [key, rule] of Object.entries(rules)) {
    if (!(key in env)) continue;
    const original = env[key];
    const { value, ok } = coerceValue(key, original, rule);
    coerced[key] = value;
    if (!ok) {
      failed.push(key);
    } else if (value !== original) {
      changed.push(key);
    }
  }

  return { coerced, changed, failed };
}

export function coerceMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  rules: CoerceRules
): Record<string, CoerceResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [name, coerceEnvMap(env, rules)])
  );
}

export function hasCoerceChanges(result: CoerceResult): boolean {
  return result.changed.length > 0 || result.failed.length > 0;
}
