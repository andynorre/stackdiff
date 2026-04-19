import fs from 'fs';
import path from 'path';

export type EnvMap = Record<string, string>;

export interface ParseResult {
  filePath: string;
  vars: EnvMap;
  errors: string[];
}

export function parseEnvFile(filePath: string): ParseResult {
  const absPath = path.resolve(filePath);
  const errors: string[] = [];
  const vars: EnvMap = {};

  if (!fs.existsSync(absPath)) {
    return { filePath, vars, errors: [`File not found: ${absPath}`] };
  }

  const lines = fs.readFileSync(absPath, 'utf-8').split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      errors.push(`Line ${idx + 1}: invalid format — "${trimmed}"`);
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) {
      errors.push(`Line ${idx + 1}: empty key`);
      return;
    }

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  });

  return { filePath, vars, errors };
}

export function parseMultipleEnvFiles(filePaths: string[]): ParseResult[] {
  return filePaths.map(parseEnvFile);
}
