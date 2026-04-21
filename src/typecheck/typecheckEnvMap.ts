export type EnvValueType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json' | 'unknown';

export interface TypecheckRule {
  key: string;
  expectedType: EnvValueType;
}

export interface TypecheckIssue {
  key: string;
  value: string;
  expectedType: EnvValueType;
  detectedType: EnvValueType;
}

export interface TypecheckResult {
  valid: boolean;
  issues: TypecheckIssue[];
}

export function detectEnvValueType(value: string): EnvValueType {
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
  try {
    new URL(value);
    if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
  } catch {}
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  try {
    JSON.parse(value);
    return 'json';
  } catch {}
  if (value.length > 0) return 'string';
  return 'unknown';
}

export function typecheckEnvMap(
  env: Record<string, string>,
  rules: TypecheckRule[]
): TypecheckResult {
  const issues: TypecheckIssue[] = [];

  for (const rule of rules) {
    const value = env[rule.key];
    if (value === undefined) continue;
    const detectedType = detectEnvValueType(value);
    if (detectedType !== rule.expectedType) {
      issues.push({ key: rule.key, value, expectedType: rule.expectedType, detectedType });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function typecheckMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  rules: TypecheckRule[]
): Record<string, TypecheckResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [name, typecheckEnvMap(env, rules)])
  );
}

export function hasTypecheckErrors(result: TypecheckResult): boolean {
  return !result.valid;
}
