import { describe, it, expect } from 'vitest';
import {
  maskString,
  maskEnvMap,
  maskMultipleEnvMaps,
  listMaskedKeys,
} from './maskEnvMap.js';

describe('maskString', () => {
  it('masks entire string by default', () => {
    expect(maskString('secret')).toBe('******');
  });

  it('respects visibleStart', () => {
    expect(maskString('secret', { visibleStart: 2 })).toBe('se****');
  });

  it('respects visibleEnd', () => {
    expect(maskString('secret', { visibleEnd: 2 })).toBe('****et');
  });

  it('respects both visibleStart and visibleEnd', () => {
    expect(maskString('secret', { visibleStart: 1, visibleEnd: 1 })).toBe('s****t');
  });

  it('uses custom mask char', () => {
    expect(maskString('abc', { char: '#' })).toBe('###');
  });

  it('fully masks short strings below minLength', () => {
    expect(maskString('ab', { minLength: 3 })).toBe('**');
  });
});

describe('maskEnvMap', () => {
  const env = { API_KEY: 'supersecret', HOST: 'localhost', TOKEN: 'abc123' };

  it('masks specified keys', () => {
    const result = maskEnvMap(env, ['API_KEY', 'TOKEN']);
    expect(result['API_KEY']).toBe('***********');
    expect(result['TOKEN']).toBe('******');
    expect(result['HOST']).toBe('localhost');
  });

  it('is case-insensitive for key matching', () => {
    const result = maskEnvMap(env, ['api_key']);
    expect(result['API_KEY']).toBe('***********');
  });

  it('returns unchanged map when no keys specified', () => {
    const result = maskEnvMap(env, []);
    expect(result).toEqual(env);
  });
});

describe('maskMultipleEnvMaps', () => {
  it('masks keys across all sources', () => {
    const maps = {
      dev: { SECRET: 'devpass', HOST: 'dev.host' },
      prod: { SECRET: 'prodpass', HOST: 'prod.host' },
    };
    const result = maskMultipleEnvMaps(maps, ['SECRET']);
    expect(result['dev']['SECRET']).toBe('*******');
    expect(result['prod']['SECRET']).toBe('********');
    expect(result['dev']['HOST']).toBe('dev.host');
  });
});

describe('listMaskedKeys', () => {
  it('returns keys that differ between original and masked', () => {
    const original = { A: 'hello', B: 'world' };
    const masked = { A: '*****', B: 'world' };
    expect(listMaskedKeys(original, masked)).toEqual(['A']);
  });

  it('returns empty array when nothing masked', () => {
    const env = { A: 'x' };
    expect(listMaskedKeys(env, env)).toEqual([]);
  });
});
