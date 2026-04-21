import { describe, it, expect } from 'vitest';
import { cloneEnvMap, cloneMultipleEnvMaps, hasCloneChanges } from './cloneEnvMap';

const base = { API_URL: 'http://api', DB_PASS: 'secret', PORT: '3000' };

describe('cloneEnvMap', () => {
  it('clones map with no options', () => {
    const result = cloneEnvMap(base);
    expect(result.cloned).toEqual(base);
    expect(result.omitted).toEqual([]);
    expect(result.overridden).toEqual([]);
  });

  it('applies prefix to all keys', () => {
    const result = cloneEnvMap(base, { prefix: 'PROD_' });
    expect(result.cloned).toHaveProperty('PROD_API_URL', 'http://api');
    expect(result.cloned).toHaveProperty('PROD_PORT', '3000');
  });

  it('applies suffix to all keys', () => {
    const result = cloneEnvMap(base, { suffix: '_COPY' });
    expect(result.cloned).toHaveProperty('API_URL_COPY');
    expect(result.cloned).toHaveProperty('PORT_COPY');
  });

  it('omits specified keys', () => {
    const result = cloneEnvMap(base, { omitKeys: ['DB_PASS'] });
    expect(result.cloned).not.toHaveProperty('DB_PASS');
    expect(result.omitted).toContain('DB_PASS');
  });

  it('applies overrides to values', () => {
    const result = cloneEnvMap(base, { overrides: { PORT: '8080' } });
    expect(result.cloned['PORT']).toBe('8080');
    expect(result.overridden).toContain('PORT');
  });

  it('preserves original source unchanged', () => {
    const result = cloneEnvMap(base, { prefix: 'X_', omitKeys: ['PORT'] });
    expect(result.source).toEqual(base);
  });

  it('combines prefix, omit, and overrides', () => {
    const result = cloneEnvMap(base, {
      prefix: 'STG_',
      omitKeys: ['DB_PASS'],
      overrides: { PORT: '4000' },
    });
    expect(result.cloned).toHaveProperty('STG_API_URL', 'http://api');
    expect(result.cloned).toHaveProperty('STG_PORT', '4000');
    expect(result.cloned).not.toHaveProperty('STG_DB_PASS');
  });
});

describe('cloneMultipleEnvMaps', () => {
  it('clones multiple maps with shared options', () => {
    const maps = { dev: base, prod: { API_URL: 'http://prod-api', PORT: '80' } };
    const results = cloneMultipleEnvMaps(maps, { prefix: 'ENV_' });
    expect(results.dev.cloned).toHaveProperty('ENV_API_URL');
    expect(results.prod.cloned).toHaveProperty('ENV_PORT', '80');
  });
});

describe('hasCloneChanges', () => {
  it('returns false when no changes', () => {
    const result = cloneEnvMap(base);
    expect(hasCloneChanges(result)).toBe(false);
  });

  it('returns true when keys are omitted', () => {
    const result = cloneEnvMap(base, { omitKeys: ['PORT'] });
    expect(hasCloneChanges(result)).toBe(true);
  });

  it('returns true when keys are overridden', () => {
    const result = cloneEnvMap(base, { overrides: { PORT: '9000' } });
    expect(hasCloneChanges(result)).toBe(true);
  });
});
