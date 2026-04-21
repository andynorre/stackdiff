import { describe, it, expect } from 'vitest';
import {
  detectEnvValueType,
  typecheckEnvMap,
  typecheckMultipleEnvMaps,
  hasTypecheckErrors,
} from './typecheckEnvMap';

describe('detectEnvValueType', () => {
  it('detects boolean values', () => {
    expect(detectEnvValueType('true')).toBe('boolean');
    expect(detectEnvValueType('false')).toBe('boolean');
  });

  it('detects numeric values', () => {
    expect(detectEnvValueType('42')).toBe('number');
    expect(detectEnvValueType('3.14')).toBe('number');
  });

  it('detects url values', () => {
    expect(detectEnvValueType('https://example.com')).toBe('url');
    expect(detectEnvValueType('http://localhost:3000')).toBe('url');
  });

  it('detects email values', () => {
    expect(detectEnvValueType('user@example.com')).toBe('email');
  });

  it('detects json values', () => {
    expect(detectEnvValueType('{"key":"val"}')).toBe('json');
  });

  it('detects plain string values', () => {
    expect(detectEnvValueType('hello-world')).toBe('string');
  });
});

describe('typecheckEnvMap', () => {
  const env = {
    PORT: '8080',
    DEBUG: 'true',
    API_URL: 'https://api.example.com',
    APP_NAME: 'myapp',
  };

  it('returns valid when all types match', () => {
    const result = typecheckEnvMap(env, [
      { key: 'PORT', expectedType: 'number' },
      { key: 'DEBUG', expectedType: 'boolean' },
      { key: 'API_URL', expectedType: 'url' },
    ]);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports issues for type mismatches', () => {
    const result = typecheckEnvMap(env, [
      { key: 'PORT', expectedType: 'string' },
      { key: 'DEBUG', expectedType: 'number' },
    ]);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].key).toBe('PORT');
    expect(result.issues[1].key).toBe('DEBUG');
  });

  it('skips keys not present in env', () => {
    const result = typecheckEnvMap(env, [{ key: 'MISSING_KEY', expectedType: 'string' }]);
    expect(result.valid).toBe(true);
  });
});

describe('typecheckMultipleEnvMaps', () => {
  it('returns results keyed by env name', () => {
    const envMaps = {
      production: { PORT: '443', DEBUG: 'false' },
      development: { PORT: 'not-a-number', DEBUG: 'true' },
    };
    const rules = [{ key: 'PORT', expectedType: 'number' as const }];
    const results = typecheckMultipleEnvMaps(envMaps, rules);
    expect(results['production'].valid).toBe(true);
    expect(results['development'].valid).toBe(false);
  });
});

describe('hasTypecheckErrors', () => {
  it('returns true when result has issues', () => {
    expect(hasTypecheckErrors({ valid: false, issues: [{ key: 'X', value: 'v', expectedType: 'number', detectedType: 'string' }] })).toBe(true);
  });

  it('returns false when result is valid', () => {
    expect(hasTypecheckErrors({ valid: true, issues: [] })).toBe(false);
  });
});
