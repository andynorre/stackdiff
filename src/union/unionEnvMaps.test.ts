import { describe, it, expect } from 'vitest';
import { unionEnvMaps, hasUnionConflicts } from './unionEnvMaps';

describe('unionEnvMaps', () => {
  const a = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
  const b = { HOST: 'prod.example.com', PORT: '3000', API_KEY: 'abc123' };
  const c = { REGION: 'us-east-1', DEBUG: 'false' };

  it('combines all unique keys from all maps', () => {
    const result = unionEnvMaps({ a, b, c });
    expect(result.totalKeys).toBe(5);
    expect(result.merged).toHaveProperty('HOST');
    expect(result.merged).toHaveProperty('PORT');
    expect(result.merged).toHaveProperty('DEBUG');
    expect(result.merged).toHaveProperty('API_KEY');
    expect(result.merged).toHaveProperty('REGION');
  });

  it('defaults to last-wins strategy', () => {
    const result = unionEnvMaps({ a, b, c });
    // HOST: a='localhost', b='prod.example.com' → last wins
    expect(result.merged.HOST).toBe('prod.example.com');
    // DEBUG: a='true', c='false' → last wins
    expect(result.merged.DEBUG).toBe('false');
  });

  it('respects first-wins strategy', () => {
    const result = unionEnvMaps({ a, b, c }, { strategy: 'first' });
    expect(result.merged.HOST).toBe('localhost');
    expect(result.merged.DEBUG).toBe('true');
  });

  it('identifies conflicting keys', () => {
    const result = unionEnvMaps({ a, b, c });
    expect(result.conflicts).toHaveProperty('HOST');
    expect(result.conflicts).toHaveProperty('DEBUG');
    // PORT is the same in both a and b — not a conflict
    expect(result.conflicts).not.toHaveProperty('PORT');
  });

  it('reports correct conflictCount', () => {
    const result = unionEnvMaps({ a, b, c });
    expect(result.conflictCount).toBe(2);
  });

  it('handles a single map with no conflicts', () => {
    const result = unionEnvMaps({ a });
    expect(result.conflictCount).toBe(0);
    expect(result.totalKeys).toBe(3);
  });

  it('handles empty input', () => {
    const result = unionEnvMaps({});
    expect(result.merged).toEqual({});
    expect(result.totalKeys).toBe(0);
    expect(result.conflictCount).toBe(0);
  });
});

describe('hasUnionConflicts', () => {
  it('returns true when conflicts exist', () => {
    const a = { KEY: 'a' };
    const b = { KEY: 'b' };
    const result = unionEnvMaps({ a, b });
    expect(hasUnionConflicts(result)).toBe(true);
  });

  it('returns false when no conflicts exist', () => {
    const a = { KEY: 'a' };
    const b = { OTHER: 'b' };
    const result = unionEnvMaps({ a, b });
    expect(hasUnionConflicts(result)).toBe(false);
  });
});
