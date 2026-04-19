import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './run';
import * as parser from '../parser';
import * as diff from '../diff';

describe('run', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints no differences and exits 0 when envs match', async () => {
    vi.spyOn(parser, 'parseMultipleEnvFiles').mockResolvedValue(
      new Map([['a.env', { KEY: 'val' }], ['b.env', { KEY: 'val' }]])
    );
    vi.spyOn(diff, 'diffEnvMaps').mockReturnValue({ added: {}, removed: {}, changed: {} } as any);
    vi.spyOn(diff, 'hasDifferences').mockReturnValue(false);

    await expect(run(['node', 'stackdiff', 'a.env', 'b.env'])).rejects.toThrow('exit');
    expect(logSpy).toHaveBeenCalledWith('No differences found.');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('prints diff and exits 1 when differences exist', async () => {
    vi.spyOn(parser, 'parseMultipleEnvFiles').mockResolvedValue(
      new Map([['a.env', { KEY: 'val1' }], ['b.env', { KEY: 'val2' }]])
    );
    vi.spyOn(diff, 'diffEnvMaps').mockReturnValue({ added: {}, removed: {}, changed: { KEY: ['val1', 'val2'] } } as any);
    vi.spyOn(diff, 'hasDifferences').mockReturnValue(true);
    vi.spyOn(diff, 'formatDiff').mockReturnValue('~ KEY: val1 -> val2');

    await expect(run(['node', 'stackdiff', 'a.env', 'b.env'])).rejects.toThrow('exit');
    expect(logSpy).toHaveBeenCalledWith('~ KEY: val1 -> val2');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
