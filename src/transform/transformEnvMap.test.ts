import { describe, it, expect } from 'vitest';
import { transformEnvMap, transformMultipleEnvMaps } from './transformEnvMap';

describe('transformEnvMap', () => {
  const sample = { DB_HOST: '  localhost  ', db_port: '5432', API_KEY: 'secret' };

  it('trims values when trimValues is true', () => {
    const result = transformEnvMap({ KEY: '  hello  ' }, { trimValues: true });
    expect(result['KEY']).toBe('hello');
  });

  it('converts keys to uppercase', () => {
    const result = transformEnvMap({ db_host: 'localhost' }, { uppercaseKeys: true });
    expect(result).toHaveProperty('DB_HOST', 'localhost');
    expect(result).not.toHaveProperty('db_host');
  });

  it('converts keys to lowercase', () => {
    const result = transformEnvMap({ DB_HOST: 'localhost' }, { lowercaseKeys: true });
    expect(result).toHaveProperty('db_host', 'localhost');
  });

  it('adds a prefix to all keys', () => {
    const result = transformEnvMap({ HOST: 'localhost' }, { addPrefix: 'APP_' });
    expect(result).toHaveProperty('APP_HOST', 'localhost');
  });

  it('removes a prefix from matching keys', () => {
    const result = transformEnvMap({ APP_HOST: 'localhost', OTHER: 'val' }, { removePrefix: 'APP_' });
    expect(result).toHaveProperty('HOST', 'localhost');
    expect(result).toHaveProperty('OTHER', 'val');
  });

  it('applies removePrefix before addPrefix', () => {
    const result = transformEnvMap(
      { APP_HOST: 'localhost' },
      { removePrefix: 'APP_', addPrefix: 'SVC_' }
    );
    expect(result).toHaveProperty('SVC_HOST', 'localhost');
  });

  it('applies a custom transform function', () => {
    const result = transformEnvMap(
      { KEY: 'value' },
      { customTransform: (k, v) => ({ key: `X_${k}`, value: v.toUpperCase() }) }
    );
    expect(result).toHaveProperty('X_KEY', 'VALUE');
  });

  it('returns empty object for empty input', () => {
    expect(transformEnvMap({}, { uppercaseKeys: true })).toEqual({});
  });
});

describe('transformMultipleEnvMaps', () => {
  it('applies transform to all maps', () => {
    const maps = {
      staging: { db_host: 'localhost' },
      production: { db_host: 'prod-db' },
    };
    const result = transformMultipleEnvMaps(maps, { uppercaseKeys: true });
    expect(result.staging).toHaveProperty('DB_HOST', 'localhost');
    expect(result.production).toHaveProperty('DB_HOST', 'prod-db');
  });
});
