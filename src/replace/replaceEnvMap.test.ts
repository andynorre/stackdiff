import { describe, it, expect } from 'vitest';
import {
  replaceInString,
  replaceEnvMap,
  replaceMultipleEnvMaps,
  hasReplaceChanges,
} from './replaceEnvMap';

describe('replaceInString', () => {
  it('replaces a plain string pattern', () => {
    expect(replaceInString('hello world', 'world', 'earth')).toBe('hello earth');
  });

  it('replaces all occurrences', () => {
    expect(replaceInString('aabbaa', 'aa', 'x')).toBe('xbbx');
  });

  it('is case-sensitive by default', () => {
    expect(replaceInString('Hello hello', 'hello', 'hi')).toBe('Hello hi');
  });

  it('is case-insensitive when flag is set', () => {
    expect(replaceInString('Hello hello', 'hello', 'hi', false)).toBe('hi hi');
  });

  it('supports RegExp pattern', () => {
    expect(replaceInString('foo123bar', /\d+/, 'NUM')).toBe('fooNUMbar');
  });
});

describe('replaceEnvMap', () => {
  it('replaces in values by default', () => {
    const result = replaceEnvMap({ DB_HOST: 'localhost', APP_URL: 'http://localhost:3000' }, {
      pattern: 'localhost',
      replacement: 'prod.example.com',
    });
    expect(result.replaced.DB_HOST).toBe('prod.example.com');
    expect(result.replaced.APP_URL).toBe('http://prod.example.com:3000');
    expect(result.changes).toHaveLength(2);
  });

  it('replaces only in keys when keysOnly is true', () => {
    const result = replaceEnvMap({ OLD_KEY: 'value' }, {
      pattern: 'OLD',
      replacement: 'NEW',
      keysOnly: true,
    });
    expect(result.replaced).toHaveProperty('NEW_KEY', 'value');
    expect(result.changes[0].field).toBe('key');
  });

  it('replaces only in values when valuesOnly is true', () => {
    const result = replaceEnvMap({ OLD_KEY: 'old_value' }, {
      pattern: 'old',
      replacement: 'new',
      valuesOnly: true,
    });
    expect(result.replaced).toHaveProperty('OLD_KEY', 'new_value');
  });

  it('returns no changes when pattern not found', () => {
    const result = replaceEnvMap({ KEY: 'value' }, { pattern: 'missing', replacement: 'x' });
    expect(result.changes).toHaveLength(0);
  });
});

describe('replaceMultipleEnvMaps', () => {
  it('applies replacement to all maps', () => {
    const results = replaceMultipleEnvMaps(
      { dev: { URL: 'http://dev.local' }, prod: { URL: 'http://prod.local' } },
      { pattern: 'local', replacement: 'example.com' }
    );
    expect(results.dev.replaced.URL).toBe('http://dev.example.com');
    expect(results.prod.replaced.URL).toBe('http://prod.example.com');
  });
});

describe('hasReplaceChanges', () => {
  it('returns true when changes exist', () => {
    const result = replaceEnvMap({ K: 'v' }, { pattern: 'v', replacement: 'w' });
    expect(hasReplaceChanges(result)).toBe(true);
  });

  it('returns false when no changes', () => {
    const result = replaceEnvMap({ K: 'v' }, { pattern: 'x', replacement: 'y' });
    expect(hasReplaceChanges(result)).toBe(false);
  });
});
