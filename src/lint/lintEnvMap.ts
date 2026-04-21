export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintRule {
  id: string;
  description: string;
  severity: LintSeverity;
}

export interface LintIssue {
  key: string;
  rule: string;
  severity: LintSeverity;
  message: string;
}

export interface LintResult {
  source: string;
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
}

const RULES: LintRule[] = [
  { id: 'no-empty-value', description: 'Value must not be empty', severity: 'warning' },
  { id: 'uppercase-key', description: 'Key should be uppercase', severity: 'error' },
  { id: 'no-spaces-in-key', description: 'Key must not contain spaces', severity: 'error' },
  { id: 'no-quotes-in-value', description: 'Value should not be wrapped in quotes', severity: 'warning' },
  { id: 'key-snake-case', description: 'Key should use snake_case or SCREAMING_SNAKE_CASE', severity: 'info' },
];

export function lintEnvMap(
  map: Record<string, string>,
  source: string
): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(map)) {
    if (value.trim() === '') {
      issues.push({ key, rule: 'no-empty-value', severity: 'warning', message: `Key "${key}" has an empty value` });
    }
    if (key !== key.toUpperCase()) {
      issues.push({ key, rule: 'uppercase-key', severity: 'error', message: `Key "${key}" should be uppercase` });
    }
    if (/\s/.test(key)) {
      issues.push({ key, rule: 'no-spaces-in-key', severity: 'error', message: `Key "${key}" contains spaces` });
    }
    if (/^["'].*["']$/.test(value)) {
      issues.push({ key, rule: 'no-quotes-in-value', severity: 'warning', message: `Value for "${key}" appears to be wrapped in quotes` });
    }
    if (!/^[A-Z][A-Z0-9_]*$/.test(key) && !/\s/.test(key)) {
      issues.push({ key, rule: 'key-snake-case', severity: 'info', message: `Key "${key}" does not follow SCREAMING_SNAKE_CASE convention` });
    }
  }

  return {
    source,
    issues,
    errorCount: issues.filter(i => i.severity === 'error').length,
    warningCount: issues.filter(i => i.severity === 'warning').length,
  };
}

export function lintMultipleEnvMaps(
  maps: Record<string, Record<string, string>>
): Record<string, LintResult> {
  return Object.fromEntries(
    Object.entries(maps).map(([source, map]) => [source, lintEnvMap(map, source)])
  );
}

export function hasLintErrors(result: LintResult): boolean {
  return result.errorCount > 0;
}

export { RULES };
