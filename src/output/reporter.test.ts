import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { generateReport, writeReport } from './reporter';
import { DiffResult } from '../diff/diffEngine';

const sampleDiff: DiffResult = {
  added: ['NEW_KEY'],
  removed: ['OLD_KEY'],
  changed: ['CHANGED_KEY'],
  unchanged: ['SAME_KEY'],
};

const diffs = { 'env.a vs env.b': sampleDiff };

describe('generateReport', () => {
  it('generates text output', () => {
    const result = generateReport(diffs, { format: 'text', color: false });
    expect(result).toContain('env.a vs env.b');
  });

  it('generates valid JSON output', () => {
    const result = generateReport(diffs, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed['env.a vs env.b'].added).toContain('NEW_KEY');
  });

  it('generates markdown output', () => {
    const result = generateReport(diffs, { format: 'markdown' });
    expect(result).toContain('# StackDiff Report');
    expect(result).toContain('### Added');
    expect(result).toContain('`NEW_KEY`');
  });

  it('shows no differences message in markdown when diff is empty', () => {
    const empty: DiffResult = { added: [], removed: [], changed: [], unchanged: ['X'] };
    const result = generateReport({ 'a vs b': empty }, { format: 'markdown' });
    expect(result).toContain('_No differences found._');
  });
});

describe('writeReport', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes content to file', () => {
    const outFile = path.join(tmpDir, 'report.txt');
    writeReport('hello world', outFile);
    expect(fs.readFileSync(outFile, 'utf-8')).toBe('hello world');
  });

  it('creates nested directories if needed', () => {
    const outFile = path.join(tmpDir, 'nested', 'dir', 'report.md');
    writeReport('# Report', outFile);
    expect(fs.existsSync(outFile)).toBe(true);
  });
});
