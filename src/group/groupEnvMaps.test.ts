import { describe, it, expect } from 'vitest';
import {
  extractGroupPrefix,
  groupEnvMap,
  groupMultipleEnvMaps,
} from './groupEnvMaps';

describe('extractGroupPrefix', () => {
  it('returns null when key has no delimiter', () => {
    expect(extractGroupPrefix('SIMPLE')).toBeNull();
  });

  it('extracts single-level prefix by default', () => {
    expect(extractGroupPrefix('DB_HOST')).toBe('DB');
    expect(extractGroupPrefix('DB_PORT')).toBe('DB');
  });

  it('extracts multi-level prefix when maxDepth > 1', () => {
    expect(extractGroupPrefix('AWS_S3_BUCKET', '_', 2)).toBe('AWS_S3');
  });

  it('returns null when parts count equals maxDepth', () => {
    expect(extractGroupPrefix('DB_HOST', '_', 2)).toBeNull();
  });
});

describe('groupEnvMap', () => {
  it('groups keys by prefix', () => {
    const envMap = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test' };
    const result = groupEnvMap(envMap);
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result['APP']).toEqual({ APP_NAME: 'test' });
  });

  it('places unprefixed keys under __ungrouped__', () => {
    const envMap = { SIMPLE: 'value', DB_HOST: 'localhost' };
    const result = groupEnvMap(envMap);
    expect(result['__ungrouped__']).toEqual({ SIMPLE: 'value' });
    expect(result['DB']).toEqual({ DB_HOST: 'localhost' });
  });

  it('handles empty envMap', () => {
    expect(groupEnvMap({})).toEqual({});
  });
});

describe('groupMultipleEnvMaps', () => {
  it('groups keys across multiple sources', () => {
    const maps = {
      dev: { DB_HOST: 'localhost', APP_NAME: 'dev-app' },
      prod: { DB_HOST: 'prod-db', DB_PORT: '5432' },
    };
    const result = groupMultipleEnvMaps(maps);
    expect(result.groups['DB']['dev']).toEqual({ DB_HOST: 'localhost' });
    expect(result.groups['DB']['prod']).toEqual({ DB_HOST: 'prod-db', DB_PORT: '5432' });
    expect(result.groups['APP']['dev']).toEqual({ APP_NAME: 'dev-app' });
  });

  it('collects ungrouped keys separately', () => {
    const maps = {
      dev: { SIMPLE: 'yes', DB_HOST: 'localhost' },
    };
    const result = groupMultipleEnvMaps(maps);
    expect(result.ungrouped['dev']).toEqual({ SIMPLE: 'yes' });
  });

  it('returns empty groups and ungrouped for empty input', () => {
    const result = groupMultipleEnvMaps({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
  });
});
