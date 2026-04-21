import { describe, it, expect } from 'vitest';
import { lintEnvMap, lintMultipleEnvMaps, hasLintErrors } from './lintEnvMap';

describe('lintEnvMap', () => {
  it('returns no issues for a clean env map', () => {
    const result = lintEnvMap({ API_KEY: 'abc123', DATABASE_URL: 'postgres://localhost' }, 'test');
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it('flags lowercase keys as errors', () => {
    const result = lintEnvMap({ api_key: 'value' }, 'test');
    const errorRules = result.issues.map(i => i.rule);
    expect(errorRules).toContain('uppercase-key');
  });

  it('flags empty values as warnings', () => {
    const result = lintEnvMap({ API_KEY: '' }, 'test');
    expect(result.issues.some(i => i.rule === 'no-empty-value')).toBe(true);
    expect(result.warningCount).toBeGreaterThan(0);
  });

  it('flags keys with spaces as errors', () => {
    const result = lintEnvMap({ 'MY KEY': 'value' }, 'test');
    expect(result.issues.some(i => i.rule === 'no-spaces-in-key')).toBe(true);
  });

  it('flags quoted values as warnings', () => {
    const result = lintEnvMap({ API_KEY: '"my-secret"' }, 'test');
    expect(result.issues.some(i => i.rule === 'no-quotes-in-value')).toBe(true);
  });

  it('flags non-screaming-snake-case keys as info', () => {
    const result = lintEnvMap({ myKey: 'value' }, 'test');
    expect(result.issues.some(i => i.rule === 'key-snake-case')).toBe(true);
  });

  it('sets source on result', () => {
    const result = lintEnvMap({}, '.env.production');
    expect(result.source).toBe('.env.production');
  });
});

describe('lintMultipleEnvMaps', () => {
  it('returns results for each source', () => {
    const maps = {
      '.env': { API_KEY: 'value' },
      '.env.staging': { bad_key: '' },
    };
    const results = lintMultipleEnvMaps(maps);
    expect(Object.keys(results)).toEqual(['.env', '.env.staging']);
    expect(results['.env'].issues).toHaveLength(0);
    expect(results['.env.staging'].issues.length).toBeGreaterThan(0);
  });
});

describe('hasLintErrors', () => {
  it('returns true when there are errors', () => {
    const result = lintEnvMap({ bad_key: 'value' }, 'test');
    expect(hasLintErrors(result)).toBe(true);
  });

  it('returns false when there are no errors', () => {
    const result = lintEnvMap({ GOOD_KEY: 'value' }, 'test');
    expect(hasLintErrors(result)).toBe(false);
  });
});
