import { describe, it, expect } from 'vitest';
import {
  detectType,
  tokenizeEnvMap,
  tokenizeMultipleEnvMaps,
  groupByType
} from './tokenizeEnvMap';

describe('detectType', () => {
  it('returns empty for blank string', () => {
    expect(detectType('')).toBe('empty');
  });

  it('detects boolean', () => {
    expect(detectType('true')).toBe('boolean');
    expect(detectType('false')).toBe('boolean');
    expect(detectType('True')).toBe('boolean');
  });

  it('detects number', () => {
    expect(detectType('42')).toBe('number');
    expect(detectType('-3.14')).toBe('number');
  });

  it('detects url', () => {
    expect(detectType('https://example.com')).toBe('url');
    expect(detectType('http://localhost:3000')).toBe('url');
  });

  it('detects path', () => {
    expect(detectType('/usr/local/bin')).toBe('path');
    expect(detectType('./config')).toBe('path');
    expect(detectType('../secrets')).toBe('path');
  });

  it('detects json', () => {
    expect(detectType('{"a":1}')).toBe('json');
    expect(detectType('[1,2,3]')).toBe('json');
  });

  it('defaults to string', () => {
    expect(detectType('hello world')).toBe('string');
    expect(detectType('my-secret-key-abc123')).toBe('string');
  });
});

describe('tokenizeEnvMap', () => {
  it('tokenizes all entries', () => {
    const env = { PORT: '3000', DEBUG: 'true', NAME: 'app', EMPTY: '' };
    const result = tokenizeEnvMap(env);
    expect(result.PORT).toEqual({ key: 'PORT', value: '3000', type: 'number' });
    expect(result.DEBUG).toEqual({ key: 'DEBUG', value: 'true', type: 'boolean' });
    expect(result.NAME).toEqual({ key: 'NAME', value: 'app', type: 'string' });
    expect(result.EMPTY).toEqual({ key: 'EMPTY', value: '', type: 'empty' });
  });

  it('returns empty object for empty input', () => {
    expect(tokenizeEnvMap({})).toEqual({});
  });
});

describe('tokenizeMultipleEnvMaps', () => {
  it('tokenizes each named map', () => {
    const maps = { dev: { PORT: '3000' }, prod: { PORT: '443' } };
    const result = tokenizeMultipleEnvMaps(maps);
    expect(result.dev.PORT.type).toBe('number');
    expect(result.prod.PORT.type).toBe('number');
  });
});

describe('groupByType', () => {
  it('groups keys by token type', () => {
    const env = { PORT: '8080', DEBUG: 'false', API: 'https://api.example.com', NOTE: 'hello' };
    const tokenized = tokenizeEnvMap(env);
    const groups = groupByType(tokenized);
    expect(groups.number).toContain('PORT');
    expect(groups.boolean).toContain('DEBUG');
    expect(groups.url).toContain('API');
    expect(groups.string).toContain('NOTE');
  });
});
