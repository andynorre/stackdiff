import { describe, it, expect } from 'vitest';
import { validateEnvMap, validateMultipleEnvMaps } from './validateEnvMap';

describe('validateEnvMap', () => {
  it('passes when required key is present', () => {
    const result = validateEnvMap({ API_KEY: 'abc123' }, [{ key: 'API_KEY', required: true }]);
    expect(result.isValid).toBe(true);
    expect(result.passed).toHaveLength(1);
  });

  it('fails when required key is missing', () => {
    const result = validateEnvMap({}, [{ key: 'API_KEY', required: true }]);
    expect(result.isValid).toBe(false);
    expect(result.failed[0].reason).toBe('missing required key');
  });

  it('fails when value is empty and allowEmpty is false', () => {
    const result = validateEnvMap({ DB_URL: '' }, [{ key: 'DB_URL', required: true, allowEmpty: false }]);
    expect(result.isValid).toBe(false);
    expect(result.failed[0].reason).toBe('value is empty');
  });

  it('passes when value is empty and allowEmpty is true', () => {
    const result = validateEnvMap({ OPTIONAL: '' }, [{ key: 'OPTIONAL', allowEmpty: true }]);
    expect(result.isValid).toBe(true);
  });

  it('fails when value does not match pattern', () => {
    const result = validateEnvMap({ PORT: 'abc' }, [{ key: 'PORT', pattern: /^\d+$/ }]);
    expect(result.isValid).toBe(false);
    expect(result.failed[0].reason).toMatch(/does not match pattern/);
  });

  it('passes when value matches pattern', () => {
    const result = validateEnvMap({ PORT: '3000' }, [{ key: 'PORT', pattern: /^\d+$/ }]);
    expect(result.isValid).toBe(true);
  });

  it('skips optional missing keys gracefully', () => {
    const result = validateEnvMap({}, [{ key: 'OPTIONAL_KEY' }]);
    expect(result.isValid).toBe(true);
    expect(result.passed).toHaveLength(1);
  });
});

describe('validateMultipleEnvMaps', () => {
  it('validates multiple env maps independently', () => {
    const maps = {
      production: { API_KEY: 'prod-key' },
      staging: {}
    };
    const rules = [{ key: 'API_KEY', required: true }];
    const results = validateMultipleEnvMaps(maps, rules);
    expect(results.production.isValid).toBe(true);
    expect(results.staging.isValid).toBe(false);
  });
});
