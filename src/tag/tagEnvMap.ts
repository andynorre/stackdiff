export type TagMap = Record<string, string[]>;

export interface TagResult {
  source: string;
  tags: TagMap;
  taggedKeys: Record<string, string[]>;
  untaggedKeys: string[];
}

/**
 * Assign tags to env keys based on prefix/pattern matchers.
 * @param envMap - flat key/value env map
 * @param tagRules - mapping of tag name to array of key prefixes or exact keys
 */
export function tagEnvMap(
  envMap: Record<string, string>,
  tagRules: TagMap
): TagResult {
  const taggedKeys: Record<string, string[]> = {};
  const taggedSet = new Set<string>();

  for (const [key] of Object.entries(envMap)) {
    const matchedTags: string[] = [];

    for (const [tag, patterns] of Object.entries(tagRules)) {
      const matched = patterns.some(
        (pattern) => key === pattern || key.startsWith(pattern)
      );
      if (matched) {
        matchedTags.push(tag);
      }
    }

    if (matchedTags.length > 0) {
      taggedKeys[key] = matchedTags;
      taggedSet.add(key);
    }
  }

  const untaggedKeys = Object.keys(envMap).filter((k) => !taggedSet.has(k));

  // Build inverse: tag -> keys
  const tags: TagMap = {};
  for (const [key, keyTags] of Object.entries(taggedKeys)) {
    for (const tag of keyTags) {
      if (!tags[tag]) tags[tag] = [];
      tags[tag].push(key);
    }
  }

  return { source: "", tags, taggedKeys, untaggedKeys };
}

export function tagMultipleEnvMaps(
  maps: Record<string, Record<string, string>>,
  tagRules: TagMap
): Record<string, TagResult> {
  const results: Record<string, TagResult> = {};
  for (const [source, envMap] of Object.entries(maps)) {
    results[source] = { ...tagEnvMap(envMap, tagRules), source };
  }
  return results;
}

export function hasTaggedKeys(result: TagResult): boolean {
  return Object.keys(result.taggedKeys).length > 0;
}
