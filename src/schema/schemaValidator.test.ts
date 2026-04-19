import { describe, it, expect } from 'vitest';
import {
  validateAgainstSchema,
  validateMultipleAgainstSchema,
  EnvSchema,
} from './schemaValidator';

const schema: EnvSchema = {
  DATABASE_URL: { required: true, pattern: /^postgres:\/\// },
  PORT: { required: true, pattern: /^\d+$/ },
  DEBUG: { required: false },
};

describe('validateAgainstSchema', () => {
  it('returns valid for matching env map', () => {
    const result = validateAgainstSchema(
      { DATABASE_URL: 'postgres://localhost/db', PORT: '5432' },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });

  it('detects missing required keys', () => {
    const result = validateAgainstSchema({ PORT: '5432' }, schema);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('DATABASE_URL');
  });

  it('detects pattern violations', () => {
    const result = validateAgainstSchema(
      { DATABASE_URL: 'mysql://localhost/db', PORT: '5432' },
      schema
    );
    expect(result.valid).toBe(false);
    expect(result.invalid[0].key).toBe('DATABASE_URL');
  });

  it('reports extra keys not in schema', () => {
    const result = validateAgainstSchema(
      { DATABASE_URL: 'postgres://localhost/db', PORT: '5432', UNKNOWN: 'x' },
      schema
    );
    expect(result.extra).toContain('UNKNOWN');
  });

  it('does not require optional keys', () => {
    const result = validateAgainstSchema(
      { DATABASE_URL: 'postgres://localhost/db', PORT: '3000' },
      schema
    );
    expect(result.missing).not.toContain('DEBUG');
  });
});

describe('validateMultipleAgainstSchema', () => {
  it('validates multiple env maps', () => {
    const results = validateMultipleAgainstSchema(
      {
        prod: { DATABASE_URL: 'postgres://prod/db', PORT: '5432' },
        dev: { DATABASE_URL: 'mysql://dev/db', PORT: 'abc' },
      },
      schema
    );
    expect(results.prod.valid).toBe(true);
    expect(results.dev.valid).toBe(false);
    expect(results.dev.invalid).toHaveLength(2);
  });
});
