export type ValidationRule = {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowEmpty?: boolean;
};

export type ValidationResult = {
  key: string;
  valid: boolean;
  reason?: string;
};

export type ValidationReport = {
  passed: ValidationResult[];
  failed: ValidationResult[];
  isValid: boolean;
};

export function validateEnvMap(
  envMap: Record<string, string>,
  rules: ValidationRule[]
): ValidationReport {
  const passed: ValidationResult[] = [];
  const failed: ValidationResult[] = [];

  for (const rule of rules) {
    const value = envMap[rule.key];

    if (rule.required && value === undefined) {
      failed.push({ key: rule.key, valid: false, reason: 'missing required key' });
      continue;
    }

    if (value === undefined) {
      passed.push({ key: rule.key, valid: true });
      continue;
    }

    if (!rule.allowEmpty && value.trim() === '') {
      failed.push({ key: rule.key, valid: false, reason: 'value is empty' });
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      failed.push({ key: rule.key, valid: false, reason: `value does not match pattern ${rule.pattern}` });
      continue;
    }

    passed.push({ key: rule.key, valid: true });
  }

  return { passed, failed, isValid: failed.length === 0 };
}

export function validateMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  rules: ValidationRule[]
): Record<string, ValidationReport> {
  const results: Record<string, ValidationReport> = {};
  for (const [name, map] of Object.entries(envMaps)) {
    results[name] = validateEnvMap(map, rules);
  }
  return results;
}
