import { describe, it, expect } from 'vitest';
import {
  resolveValue,
  interpolateEnvMap,
  interpolateMultipleEnvMaps,
} from './interpolateEnvMap';

describe('resolveValue', () => {
  it('replaces ${VAR} syntax', () => {
    const { resolved } = resolveValue('hello ${NAME}', { NAME: 'world' });
    expect(resolved).toBe('hello world');
  });

  it('replaces $VAR syntax', () => {
    const { resolved } = resolveValue('hello $NAME', { NAME: 'world' });
    expect(resolved).toBe('hello world');
  });

  it('tracks unresolved variables', () => {
    const { resolved, unresolved } = resolveValue('${FOO} and ${BAR}', { FOO: '1' });
    expect(resolved).toBe('1 and ${BAR}');
    expect(unresolved).toContain('BAR');
  });

  it('returns original value when no references present', () => {
    const { resolved, unresolved } = resolveValue('plain-value', {});
    expect(resolved).toBe('plain-value');
    expect(unresolved).toHaveLength(0);
  });
});

describe('interpolateEnvMap', () => {
  it('interpolates self-references within the map', () => {
    const envMap = {
      BASE_URL: 'https://example.com',
      API_URL: '${BASE_URL}/api',
    };
    const { interpolated, unresolved } = interpolateEnvMap(envMap);
    expect(interpolated.API_URL).toBe('https://example.com/api');
    expect(unresolved).toHaveLength(0);
  });

  it('uses external context for resolution', () => {
    const envMap = { FULL_URL: '${HOST}:${PORT}' };
    const external = { HOST: 'localhost', PORT: '3000' };
    const { interpolated } = interpolateEnvMap(envMap, external);
    expect(interpolated.FULL_URL).toBe('localhost:3000');
  });

  it('reports unresolved keys', () => {
    const envMap = { URL: '${MISSING_VAR}/path' };
    const { unresolved } = interpolateEnvMap(envMap);
    expect(unresolved).toContain('MISSING_VAR');
  });

  it('deduplicates unresolved keys', () => {
    const envMap = {
      A: '${GHOST}',
      B: '${GHOST}',
    };
    const { unresolved } = interpolateEnvMap(envMap);
    expect(unresolved.filter((k) => k === 'GHOST')).toHaveLength(1);
  });
});

describe('interpolateMultipleEnvMaps', () => {
  it('processes each map independently', () => {
    const maps = {
      production: { URL: '${BASE}/prod' },
      staging: { URL: '${BASE}/staging' },
    };
    const results = interpolateMultipleEnvMaps(maps, { BASE: 'https://app.io' });
    expect(results.production.interpolated.URL).toBe('https://app.io/prod');
    expect(results.staging.interpolated.URL).toBe('https://app.io/staging');
  });

  it('returns empty results for empty input', () => {
    const results = interpolateMultipleEnvMaps({});
    expect(Object.keys(results)).toHaveLength(0);
  });
});
