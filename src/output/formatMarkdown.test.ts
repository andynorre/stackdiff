import { describe, it, expect } from 'vitest';
import { formatMarkdownTable } from './formatMarkdown';
import { DiffResult } from '../diff/diffEngine';

const diff: DiffResult = {
  added: ['API_KEY'],
  removed: ['LEGACY_URL'],
  changed: ['DB_HOST'],
  unchanged: ['PORT'],
};

describe('formatMarkdownTable', () => {
  it('includes the label as heading', () => {
    const result = formatMarkdownTable('prod vs staging', diff);
    expect(result).toContain('## prod vs staging');
  });

  it('renders added keys', () => {
    const result = formatMarkdownTable('a vs b', diff);
    expect(result).toContain('Added');
    expect(result).toContain('`API_KEY`');
  });

  it('renders removed keys', () => {
    const result = formatMarkdownTable('a vs b', diff);
    expect(result).toContain('Removed');
    expect(result).toContain('`LEGACY_URL`');
  });

  it('renders changed keys', () => {
    const result = formatMarkdownTable('a vs b', diff);
    expect(result).toContain('Changed');
    expect(result).toContain('`DB_HOST`');
  });

  it('shows none row when diff is completely empty', () => {
    const empty: DiffResult = { added: [], removed: [], changed: [], unchanged: [] };
    const result = formatMarkdownTable('x vs y', empty);
    expect(result).toContain('_none_');
  });

  it('renders a markdown table header', () => {
    const result = formatMarkdownTable('a vs b', diff);
    expect(result).toContain('| Status | Key |');
    expect(result).toContain('|--------|-----|');
  });
});
