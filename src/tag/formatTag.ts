import type { EnvMap } from '../parser/envParser';

export interface TagResult {
  source: string;
  original: EnvMap;
  tagged: EnvMap;
  tags: Record<string, string[]>;
}

export interface TagStats {
  totalKeys: number;
  taggedKeys: number;
  uniqueTags: number;
}

export function collectTagStats(result: TagResult): TagStats {
  const taggedKeys = Object.keys(result.tags).length;
  const allTags = Object.values(result.tags).flat();
  const uniqueTags = new Set(allTags).size;

  return {
    totalKeys: Object.keys(result.original).length,
    taggedKeys,
    uniqueTags,
  };
}

export function formatTagResult(result: TagResult): string {
  const stats = collectTagStats(result);
  const lines: string[] = [];

  lines.push(`Source: ${result.source}`);
  lines.push(
    `Tagged ${stats.taggedKeys}/${stats.totalKeys} keys with ${stats.uniqueTags} unique tag(s).`
  );

  if (stats.taggedKeys > 0) {
    lines.push('');
    for (const [key, tags] of Object.entries(result.tags)) {
      lines.push(`  ${key}: [${tags.join(', ')}]`);
    }
  }

  return lines.join('\n');
}

export function formatMultipleTagResults(results: TagResult[]): string {
  if (results.length === 0) return 'No sources to tag.';

  const sections = results.map((r) => formatTagResult(r));
  const totalTagged = results.reduce(
    (sum, r) => sum + collectTagStats(r).taggedKeys,
    0
  );

  return [
    ...sections,
    '',
    `Total: ${totalTagged} key(s) tagged across ${results.length} source(s).`,
  ].join('\n\n');
}

export function countTaggedTotal(results: TagResult[]): number {
  return results.reduce((sum, r) => sum + collectTagStats(r).taggedKeys, 0);
}
