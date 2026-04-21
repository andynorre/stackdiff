import { describe, it, expect } from 'vitest';
import { exportEnvMap, exportMultipleEnvMaps } from './exportEnvMap';

const sampleMap = {
  DATABASE_URL: 'postgres://localhost/db',
  APP_NAME: 'my app',
  DEBUG: 'true',
  PORT: '3000',
};

describe('exportEnvMap', () => {
  it('exports dotenv format', () => {
    const result = exportEnvMap(sampleMap, { format: 'dotenv' });
    expect(result.format).toBe('dotenv');
    expect(result.keyCount).toBe(4);
    expect(result.content).toContain('DATABASE_URL=postgres://localhost/db');
    expect(result.content).toContain('APP_NAME="my app"');
  });

  it('exports json format', () => {
    const result = exportEnvMap(sampleMap, { format: 'json' });
    const parsed = JSON.parse(result.content);
    expect(parsed.PORT).toBe('3000');
    expect(parsed.DEBUG).toBe('true');
  });

  it('exports yaml format', () => {
    const result = exportEnvMap(sampleMap, { format: 'yaml' });
    expect(result.content).toContain('PORT: "3000"');
    expect(result.content).toContain('DEBUG: "true"');
  });

  it('exports shell format', () => {
    const result = exportEnvMap(sampleMap, { format: 'shell' });
    expect(result.content).toContain('export PORT=3000');
    expect(result.content).toContain('export APP_NAME="my app"');
  });

  it('sorts keys when sortKeys is true', () => {
    const result = exportEnvMap(sampleMap, { format: 'dotenv', sortKeys: true });
    const lines = result.content.trim().split('\n');
    const keys = lines.map(l => l.split('=')[0]);
    expect(keys).toEqual([...keys].sort());
  });

  it('throws on unsupported format', () => {
    expect(() =>
      exportEnvMap(sampleMap, { format: 'csv' as any })
    ).toThrow('Unsupported export format');
  });

  it('returns correct keyCount', () => {
    const result = exportEnvMap({ A: '1', B: '2' }, { format: 'json' });
    expect(result.keyCount).toBe(2);
  });
});

describe('exportMultipleEnvMaps', () => {
  it('exports multiple maps', () => {
    const maps = { dev: { FOO: 'bar' }, prod: { FOO: 'baz' } };
    const results = exportMultipleEnvMaps(maps, { format: 'dotenv' });
    expect(results.dev.content).toContain('FOO=bar');
    expect(results.prod.content).toContain('FOO=baz');
  });
});
