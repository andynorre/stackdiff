import { describe, it, expect } from 'vitest';
import { syncEnvMaps, hasSyncChanges } from './syncEnvMaps';

describe('syncEnvMaps', () => {
  const source = { API_URL: 'https://api.example.com', DB_HOST: 'localhost', NEW_KEY: 'new' };
  const target = { API_URL: 'https://old.example.com', DB_HOST: 'localhost', OLD_KEY: 'old' };

  it('identifies keys in source not present in target as added', () => {
    const { result } = syncEnvMaps(source, target, 'source', 'target');
    expect(result.added).toEqual({ NEW_KEY: 'new' });
  });

  it('identifies keys in target not present in source as removed', () => {
    const { result } = syncEnvMaps(source, target, 'source', 'target');
    expect(result.removed).toContain('OLD_KEY');
  });

  it('does not mark updated keys when overwrite is false', () => {
    const { result } = syncEnvMaps(source, target, 'source', 'target', { overwrite: false });
    expect(result.updated).toEqual({});
  });

  it('marks changed values as updated when overwrite is true', () => {
    const { result } = syncEnvMaps(source, target, 'source', 'target', { overwrite: true });
    expect(result.updated).toEqual({ API_URL: 'https://api.example.com' });
  });

  it('applies added keys to synced map', () => {
    const { synced } = syncEnvMaps(source, target, 'source', 'target');
    expect(synced['NEW_KEY']).toBe('new');
    expect(synced['OLD_KEY']).toBe('old');
  });

  it('applies updated values to synced map when overwrite is true', () => {
    const { synced } = syncEnvMaps(source, target, 'source', 'target', { overwrite: true });
    expect(synced['API_URL']).toBe('https://api.example.com');
  });

  it('does not overwrite existing values when overwrite is false', () => {
    const { synced } = syncEnvMaps(source, target, 'source', 'target', { overwrite: false });
    expect(synced['API_URL']).toBe('https://old.example.com');
  });

  it('stores correct source and target labels in result', () => {
    const { result } = syncEnvMaps(source, target, 'prod', 'staging');
    expect(result.source).toBe('prod');
    expect(result.target).toBe('staging');
  });
});

describe('hasSyncChanges', () => {
  it('returns true when there are added keys', () => {
    const result = { source: 'a', target: 'b', added: { X: '1' }, removed: [], updated: {} };
    expect(hasSyncChanges(result)).toBe(true);
  });

  it('returns true when there are removed keys', () => {
    const result = { source: 'a', target: 'b', added: {}, removed: ['Y'], updated: {} };
    expect(hasSyncChanges(result)).toBe(true);
  });

  it('returns false when nothing changed', () => {
    const result = { source: 'a', target: 'b', added: {}, removed: [], updated: {} };
    expect(hasSyncChanges(result)).toBe(false);
  });
});
