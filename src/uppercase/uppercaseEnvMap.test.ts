import { describe, it, expect } from 'vitest';
import {
  uppercaseEnvMap,
  uppercaseMultipleEnvMaps,
  hasUppercaseChanges,
} from './uppercaseEnvMap';

const sampleEnv = {
  api_key: 'abc123',
  db_host: 'localhost',
  Port: '3000',
};

describe('uppercaseEnvMap', () => {
  it('uppercases keys by default', () => {
    const result = uppercaseEnvMap('test', sampleEnv);
    expect(result.result).toHaveProperty('API_KEY', 'abc123');
    expect(result.result).toHaveProperty('DB_HOST', 'localhost');
    expect(result.result).toHaveProperty('PORT', '3000');
  });

  it('does not uppercase values by default', () => {
    const result = uppercaseEnvMap('test', sampleEnv);
    expect(result.result['API_KEY']).toBe('abc123');
  });

  it('uppercases values when option is set', () => {
    const result = uppercaseEnvMap('test', sampleEnv, { keys: false, values: true });
    expect(result.result['api_key']).toBe('ABC123');
    expect(result.result['db_host']).toBe('LOCALHOST');
  });

  it('uppercases both keys and values when both options set', () => {
    const result = uppercaseEnvMap('test', sampleEnv, { keys: true, values: true });
    expect(result.result['API_KEY']).toBe('ABC123');
    expect(result.result['PORT']).toBe('3000');
  });

  it('tracks changed keys', () => {
    const result = uppercaseEnvMap('test', sampleEnv);
    expect(result.changedKeys).toContain('api_key');
    expect(result.changedKeys).toContain('db_host');
  });

  it('returns correct source name', () => {
    const result = uppercaseEnvMap('.env.production', sampleEnv);
    expect(result.source).toBe('.env.production');
  });

  it('returns original unchanged', () => {
    const result = uppercaseEnvMap('test', sampleEnv);
    expect(result.original).toEqual(sampleEnv);
  });
});

describe('uppercaseMultipleEnvMaps', () => {
  it('processes multiple env maps', () => {
    const maps = { dev: sampleEnv, prod: { secret: 'value' } };
    const results = uppercaseMultipleEnvMaps(maps);
    expect(results['dev'].result).toHaveProperty('API_KEY');
    expect(results['prod'].result).toHaveProperty('SECRET');
  });
});

describe('hasUppercaseChanges', () => {
  it('returns true when there are changes', () => {
    const result = uppercaseEnvMap('test', { my_key: 'val' });
    expect(hasUppercaseChanges(result)).toBe(true);
  });

  it('returns false when keys are already uppercase', () => {
    const result = uppercaseEnvMap('test', { MY_KEY: 'val' });
    expect(hasUppercaseChanges(result)).toBe(false);
  });
});
