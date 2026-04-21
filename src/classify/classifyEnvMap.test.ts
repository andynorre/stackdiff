import { describe, it, expect } from 'vitest';
import {
  classifyKey,
  classifyEnvMap,
  classifyMultipleEnvMaps,
  groupByCategory,
} from './classifyEnvMap';

describe('classifyKey', () => {
  it('classifies database keys', () => {
    expect(classifyKey('DB_HOST')).toBe('database');
    expect(classifyKey('POSTGRES_URI')).toBe('database');
    expect(classifyKey('MONGO_URL')).toBe('database');
  });

  it('classifies auth keys', () => {
    expect(classifyKey('JWT_SECRET')).toBe('auth');
    expect(classifyKey('API_KEY')).toBe('auth');
    expect(classifyKey('AUTH_TOKEN')).toBe('auth');
  });

  it('classifies network keys', () => {
    expect(classifyKey('PORT')).toBe('network');
    expect(classifyKey('BASE_URL')).toBe('network');
    expect(classifyKey('API_URL')).toBe('network');
  });

  it('classifies feature flag keys', () => {
    expect(classifyKey('FEATURE_DARK_MODE')).toBe('feature_flag');
    expect(classifyKey('ENABLE_BETA')).toBe('feature_flag');
    expect(classifyKey('FF_NEW_UI')).toBe('feature_flag');
  });

  it('classifies logging keys', () => {
    expect(classifyKey('LOG_LEVEL')).toBe('logging');
    expect(classifyKey('SENTRY_DSN')).toBe('logging');
    expect(classifyKey('DEBUG')).toBe('logging');
  });

  it('classifies storage keys', () => {
    expect(classifyKey('S3_BUCKET')).toBe('storage');
    expect(classifyKey('CDN_URL')).toBe('storage');
  });

  it('falls back to other', () => {
    expect(classifyKey('APP_NAME')).toBe('other');
    expect(classifyKey('NODE_ENV')).toBe('other');
  });
});

describe('classifyEnvMap', () => {
  it('classifies all entries in a map', () => {
    const env = { DB_HOST: 'localhost', JWT_SECRET: 'abc', APP_NAME: 'myapp' };
    const result = classifyEnvMap(env);
    expect(result['DB_HOST'].category).toBe('database');
    expect(result['JWT_SECRET'].category).toBe('auth');
    expect(result['APP_NAME'].category).toBe('other');
  });

  it('preserves key and value in entry', () => {
    const env = { PORT: '3000' };
    const result = classifyEnvMap(env);
    expect(result['PORT']).toEqual({ key: 'PORT', value: '3000', category: 'network' });
  });
});

describe('classifyMultipleEnvMaps', () => {
  it('classifies multiple named maps', () => {
    const maps = { dev: { DB_HOST: 'localhost' }, prod: { S3_BUCKET: 'my-bucket' } };
    const result = classifyMultipleEnvMaps(maps);
    expect(result['dev']['DB_HOST'].category).toBe('database');
    expect(result['prod']['S3_BUCKET'].category).toBe('storage');
  });
});

describe('groupByCategory', () => {
  it('groups keys by their category', () => {
    const env = { DB_HOST: 'localhost', PORT: '3000', APP_NAME: 'x' };
    const classified = classifyEnvMap(env);
    const groups = groupByCategory(classified);
    expect(groups['database']).toContain('DB_HOST');
    expect(groups['network']).toContain('PORT');
    expect(groups['other']).toContain('APP_NAME');
  });
});
