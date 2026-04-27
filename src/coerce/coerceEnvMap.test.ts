import { describe, it, expect } from 'vitest';
import {
  coerceEnvMap,
  coerceMultipleEnvMaps,
  hasCoerceChanges,
  CoerceRules,
} from './coerceEnvMap';

describe('coerceEnvMap', () => {
  it('coerces boolean values', () => {
    const env = { ENABLED: 'yes', DEBUG: '0', VERBOSE: 'true' };
    const rules: CoerceRules = {
      ENABLED: { type: 'boolean' },
      DEBUG: { type: 'boolean' },
      VERBOSE: { type: 'boolean' },
    };
    const result = coerceEnvMap(env, rules);
    expect(result.coerced.ENABLED).toBe('true');
    expect(result.coerced.DEBUG).toBe('false');
    expect(result.coerced.VERBOSE).toBe('true');
    expect(result.changed).toContain('ENABLED');
    expect(result.changed).toContain('DEBUG');
    expect(result.failed).toHaveLength(0);
  });

  it('coerces number values', () => {
    const env = { PORT: '8080', TIMEOUT: 'abc' };
    const rules: CoerceRules = {
      PORT: { type: 'number' },
      TIMEOUT: { type: 'number', fallback: '30' },
    };
    const result = coerceEnvMap(env, rules);
    expect(result.coerced.PORT).toBe('8080');
    expect(result.coerced.TIMEOUT).toBe('30');
    expect(result.failed).toContain('TIMEOUT');
    expect(result.changed).not.toContain('PORT');
  });

  it('validates json values', () => {
    const env = { CONFIG: '{"key":"val"}', BAD_JSON: 'not-json' };
    const rules: CoerceRules = {
      CONFIG: { type: 'json' },
      BAD_JSON: { type: 'json', fallback: '{}' },
    };
    const result = coerceEnvMap(env, rules);
    expect(result.coerced.CONFIG).toBe('{"key":"val"}');
    expect(result.coerced.BAD_JSON).toBe('{}');
    expect(result.failed).toContain('BAD_JSON');
  });

  it('skips keys not present in env', () => {
    const env = { A: '1' };
    const rules: CoerceRules = { B: { type: 'number' } };
    const result = coerceEnvMap(env, rules);
    expect(result.coerced).toEqual({ A: '1' });
    expect(result.changed).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it('leaves string type unchanged', () => {
    const env = { NAME: 'hello' };
    const rules: CoerceRules = { NAME: { type: 'string' } };
    const result = coerceEnvMap(env, rules);
    expect(result.coerced.NAME).toBe('hello');
    expect(result.changed).toHaveLength(0);
  });
});

describe('coerceMultipleEnvMaps', () => {
  it('applies rules across multiple maps', () => {
    const maps = {
      dev: { PORT: '3000', DEBUG: 'yes' },
      prod: { PORT: '80', DEBUG: 'no' },
    };
    const rules: CoerceRules = {
      PORT: { type: 'number' },
      DEBUG: { type: 'boolean' },
    };
    const results = coerceMultipleEnvMaps(maps, rules);
    expect(results.dev.coerced.DEBUG).toBe('true');
    expect(results.prod.coerced.DEBUG).toBe('false');
  });
});

describe('hasCoerceChanges', () => {
  it('returns true when there are changes', () => {
    expect(hasCoerceChanges({ coerced: {}, changed: ['A'], failed: [] })).toBe(true);
  });

  it('returns true when there are failures', () => {
    expect(hasCoerceChanges({ coerced: {}, changed: [], failed: ['B'] })).toBe(true);
  });

  it('returns false when nothing changed', () => {
    expect(hasCoerceChanges({ coerced: {}, changed: [], failed: [] })).toBe(false);
  });
});
