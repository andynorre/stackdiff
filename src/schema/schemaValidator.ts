import { EnvMap } from '../parser/envParser';

export interface SchemaField {
  required: boolean;
  pattern?: RegExp;
  description?: string;
}

export type EnvSchema = Record<string, SchemaField>;

export interface SchemaValidationResult {
  valid: boolean;
  missing: string[];
  invalid: { key: string; value: string; pattern: string }[];
  extra: string[];
}

export function validateAgainstSchema(
  envMap: EnvMap,
  schema: EnvSchema
): SchemaValidationResult {
  const missing: string[] = [];
  const invalid: { key: string; value: string; pattern: string }[] = [];
  const extra: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    if (field.required && !(key in envMap)) {
      missing.push(key);
      continue;
    }
    if (key in envMap && field.pattern) {
      const value = envMap[key];
      if (!field.pattern.test(value)) {
        invalid.push({ key, value, pattern: field.pattern.toString() });
      }
    }
  }

  for (const key of Object.keys(envMap)) {
    if (!(key in schema)) {
      extra.push(key);
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    extra,
  };
}

export function validateMultipleAgainstSchema(
  envMaps: Record<string, EnvMap>,
  schema: EnvSchema
): Record<string, SchemaValidationResult> {
  const results: Record<string, SchemaValidationResult> = {};
  for (const [name, envMap] of Object.entries(envMaps)) {
    results[name] = validateAgainstSchema(envMap, schema);
  }
  return results;
}
