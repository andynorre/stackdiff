import { describe, it, expect, vi } from 'vitest';
import { parseCliOptions } from './options';

describe('parseCliOptions', () => {
  it('parses two file arguments', () => {
    const opts = parseCliOptions(['node', 'stackdiff', '.env', '.env.production']);
    expect(opts.files).toEqual(['.env', '.env.production']);
  });

  it('defaults output to text', () => {
    const opts = parseCliOptions(['node', 'stackdiff', 'a.env', 'b.env']);
    expect(opts.output).toBe('text');
  });

  it('parses --output json', () => {
    const opts = parseCliOptions(['node', 'stackdiff', 'a.env', 'b.env', '--output', 'json']);
    expect(opts.output).toBe('json');
  });

  it('parses --ignore-values flag', () => {
    const opts = parseCliOptions(['node', 'stackdiff', 'a.env', 'b.env', '--ignore-values']);
    expect(opts.ignoreValues).toBe(true);
  });

  it('parses --only-missing flag', () => {
    const opts = parseCliOptions(['node', 'stackdiff', 'a.env', 'b.env', '--only-missing']);
    expect(opts.onlyMissing).toBe(true);
  });

  it('exits when fewer than two files provided', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => parseCliOptions(['node', 'stackdiff', 'a.env'])).toThrow('exit');
    exitSpy.mockRestore();
  });
});
