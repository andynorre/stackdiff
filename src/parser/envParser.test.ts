import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseEnvFile, parseMultipleEnvFiles } from './envParser';

const TMP_DIR = path.resolve(__dirname, '__tmp__');

function writeFile(name: string, content: string): string {
  const p = path.join(TMP_DIR, name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

beforeEach(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
});

afterEach(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('parseEnvFile', () => {
  it('parses basic key=value pairs', () => {
    const p = writeFile('.env', 'FOO=bar\nBAZ=qux\n');
    const result = parseEnvFile(p);
    expect(result.vars).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.errors).toHaveLength(0);
  });

  it('strips surrounding quotes', () => {
    const p = writeFile('.env', 'KEY="hello world"\n');
    const result = parseEnvFile(p);
    expect(result.vars.KEY).toBe('hello world');
  });

  it('ignores comments and blank lines', () => {
    const p = writeFile('.env', '# comment\n\nA=1\n');
    const result = parseEnvFile(p);
    expect(Object.keys(result.vars)).toEqual(['A']);
  });

  it('reports error for missing file', () => {
    const result = parseEnvFile('/nonexistent/.env');
    expect(result.errors[0]).toMatch(/File not found/);
  });

  it('reports error for invalid line format', () => {
    const p = writeFile('.env', 'INVALID_LINE\n');
    const result = parseEnvFile(p);
    expect(result.errors[0]).toMatch(/invalid format/);
  });

  it('parses multiple files', () => {
    const p1 = writeFile('.env.a', 'X=1\n');
    const p2 = writeFile('.env.b', 'Y=2\n');
    const results = parseMultipleEnvFiles([p1, p2]);
    expect(results).toHaveLength(2);
    expect(results[0].vars.X).toBe('1');
    expect(results[1].vars.Y).toBe('2');
  });
});
