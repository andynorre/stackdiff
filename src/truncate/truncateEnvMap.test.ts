import { describe, it, expect } from 'vitest';
import {
  truncateValue,
  truncateEnvMap,
  truncateMultipleEnvMaps,
  hasTruncateChanges,
} from './truncateEnvMap';

describe('truncateValue', () => {
  it('returns the value unchanged if within maxLength', () => {
    expect(truncateValue('hello', 10, '...')).toBe('hello');
  });

  it('truncates and appends suffix when value exceeds maxLength', () => {
    expect(truncateValue('hello world', 8, '...')).toBe('hello...');
  });

  it('handles suffix longer than maxLength gracefully', () => {
    expect(truncateValue('abcdef', 2, '...')).toBe('..');
  });

  it('uses custom suffix', () => {
    expect(truncateValue('longvalue', 6, '--')).toBe('long--');
  });
});

describe('truncateEnvMap', () => {
  const env = {
    SHORT: 'ok',
    LONG_VALUE_KEY: 'this is a very long value that should be truncated',
    ANOTHER: 'fine',
  };

  it('truncates values exceeding maxLength', () => {
    const result = truncateEnvMap(env, { maxLength: 10 });
    expect(result.truncated['LONG_VALUE_KEY']).toBe('this is...');
    expect(result.truncated['SHORT']).toBe('ok');
  });

  it('tracks affected keys', () => {
    const result = truncateEnvMap(env, { maxLength: 10 });
    expect(result.affectedKeys).toContain('LONG_VALUE_KEY');
    expect(result.affectedKeys).not.toContain('SHORT');
  });

  it('respects valuesOnly flag — does not truncate keys', () => {
    const result = truncateEnvMap({ LONG_VALUE_KEY: 'short' }, { maxLength: 5, valuesOnly: true });
    expect(Object.keys(result.truncated)[0]).toBe('LONG_VALUE_KEY');
  });

  it('respects keysOnly flag — does not truncate values', () => {
    const result = truncateEnvMap({ AB: 'this is a long value' }, { maxLength: 5, keysOnly: true });
    expect(result.truncated['AB']).toBe('this is a long value');
  });

  it('preserves original map unchanged', () => {
    const result = truncateEnvMap(env, { maxLength: 5 });
    expect(result.original).toEqual(env);
  });
});

describe('truncateMultipleEnvMaps', () => {
  it('applies truncation to each named env map', () => {
    const maps = {
      dev: { KEY: 'short' },
      prod: { KEY: 'a very long value indeed' },
    };
    const results = truncateMultipleEnvMaps(maps, { maxLength: 10 });
    expect(results['dev'].affectedKeys).toHaveLength(0);
    expect(results['prod'].affectedKeys).toContain('KEY');
  });
});

describe('hasTruncateChanges', () => {
  it('returns true when there are affected keys', () => {
    const result = truncateEnvMap({ KEY: 'a very long string' }, { maxLength: 5 });
    expect(hasTruncateChanges(result)).toBe(true);
  });

  it('returns false when nothing was truncated', () => {
    const result = truncateEnvMap({ KEY: 'hi' }, { maxLength: 10 });
    expect(hasTruncateChanges(result)).toBe(false);
  });
});
