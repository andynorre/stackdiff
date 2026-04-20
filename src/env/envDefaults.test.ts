import { describe, it, expect } from 'vitest';
import {
  applyDefaults,
  applyDefaultsToMultiple,
  missingDefaults,
} from './envDefaults';

describe('applyDefaults', () => {
  it('fills in missing keys from defaults', () => {
    const target = { FOO: 'bar' };
    const defaults = { FOO: 'default_foo', BAZ: 'default_baz' };
    const result = applyDefaults(target, defaults);
    expect(result).toEqual({ FOO: 'bar', BAZ: 'default_baz' });
  });

  it('does not overwrite existing keys by default', () => {
    const target = { FOO: 'existing' };
    const defaults = { FOO: 'default_foo' };
    const result = applyDefaults(target, defaults);
    expect(result.FOO).toBe('existing');
  });

  it('overwrites empty string values when overwrite is true', () => {
    const target = { FOO: '' };
    const defaults = { FOO: 'filled' };
    const result = applyDefaults(target, defaults, { overwrite: true });
    expect(result.FOO).toBe('filled');
  });

  it('does not mutate the original target', () => {
    const target = { FOO: 'bar' };
    const defaults = { BAZ: 'baz_val' };
    applyDefaults(target, defaults);
    expect(target).not.toHaveProperty('BAZ');
  });

  it('returns a copy even when no defaults apply', () => {
    const target = { A: '1' };
    const result = applyDefaults(target, {});
    expect(result).toEqual({ A: '1' });
    expect(result).not.toBe(target);
  });
});

describe('applyDefaultsToMultiple', () => {
  it('applies defaults to each named map', () => {
    const targets = {
      staging: { HOST: 'staging.example.com' },
      production: { HOST: 'prod.example.com', PORT: '443' },
    };
    const defaults = { PORT: '3000', DEBUG: 'false' };
    const result = applyDefaultsToMultiple(targets, defaults);
    expect(result.staging.PORT).toBe('3000');
    expect(result.production.PORT).toBe('443');
    expect(result.staging.DEBUG).toBe('false');
    expect(result.production.DEBUG).toBe('false');
  });
});

describe('missingDefaults', () => {
  it('returns keys present in defaults but absent in target', () => {
    const target = { FOO: 'foo' };
    const defaults = { FOO: 'f', BAR: 'b', BAZ: 'z' };
    expect(missingDefaults(target, defaults)).toEqual(['BAR', 'BAZ']);
  });

  it('returns empty array when all defaults are present', () => {
    const target = { FOO: 'foo', BAR: 'bar' };
    const defaults = { FOO: 'f', BAR: 'b' };
    expect(missingDefaults(target, defaults)).toEqual([]);
  });
});
