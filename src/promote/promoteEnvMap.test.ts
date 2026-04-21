import { describe, it, expect } from 'vitest';
import {
  promoteEnvMap,
  promoteMultipleEnvMaps,
  hasPromoteChanges,
} from './promoteEnvMap';

const source = { API_URL: 'https://prod.example.com', SECRET: 'abc123', NEW_KEY: 'new' };
const target = { API_URL: 'https://staging.example.com', EXISTING: 'keep' };

describe('promoteEnvMap', () => {
  it('fills missing keys by default', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging');
    expect(result.promoted).toHaveProperty('SECRET');
    expect(result.promoted).toHaveProperty('NEW_KEY');
    expect(result.skipped['API_URL'].reason).toBe('already exists in target');
  });

  it('overwrites existing keys in overwrite mode', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging', { mode: 'overwrite' });
    expect(result.promoted['API_URL'].to).toBe('https://prod.example.com');
    expect(result.promoted['API_URL'].from).toBe('https://staging.example.com');
  });

  it('does not mutate target in dry-run mode', () => {
    const original = { ...target };
    promoteEnvMap(source, target, 'prod', 'staging', { mode: 'dry-run' });
    expect(target).toEqual(original);
  });

  it('dry-run reports promoted keys without applying changes', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging', { mode: 'dry-run' });
    expect(result.promoted).toHaveProperty('API_URL');
    expect(result.promoted).toHaveProperty('SECRET');
  });

  it('only promotes specified keys when keys option is set', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging', {
      mode: 'overwrite',
      keys: ['API_URL'],
    });
    expect(result.promoted).toHaveProperty('API_URL');
    expect(result.promoted).not.toHaveProperty('SECRET');
  });

  it('skips keys not found in source', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging', {
      mode: 'overwrite',
      keys: ['MISSING_KEY'],
    });
    expect(result.skipped['MISSING_KEY'].reason).toBe('not found in source');
  });

  it('sets source and target labels on result', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging');
    expect(result.source).toBe('prod');
    expect(result.target).toBe('staging');
  });
});

describe('promoteMultipleEnvMaps', () => {
  it('promotes to multiple targets', () => {
    const targets = { staging: { ...target }, dev: { DEV_ONLY: 'yes' } };
    const results = promoteMultipleEnvMaps(source, targets, 'prod');
    expect(results).toHaveProperty('staging');
    expect(results).toHaveProperty('dev');
    expect(results['dev'].promoted).toHaveProperty('API_URL');
  });
});

describe('hasPromoteChanges', () => {
  it('returns true when there are promoted keys', () => {
    const result = promoteEnvMap(source, target, 'prod', 'staging');
    expect(hasPromoteChanges(result)).toBe(true);
  });

  it('returns false when nothing was promoted', () => {
    const result = promoteEnvMap({}, target, 'prod', 'staging');
    expect(hasPromoteChanges(result)).toBe(false);
  });
});
