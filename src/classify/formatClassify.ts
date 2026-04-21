import type { ClassifiedEnvMap, EnvCategory } from './classifyEnvMap';
import { groupByCategory } from './classifyEnvMap';

const CATEGORY_LABELS: Record<EnvCategory, string> = {
  database: 'Database',
  auth: 'Auth / Secrets',
  network: 'Network / URLs',
  feature_flag: 'Feature Flags',
  logging: 'Logging / Monitoring',
  cache: 'Cache',
  storage: 'Storage',
  other: 'Other',
};

export function formatCategorySection(
  category: EnvCategory,
  keys: string[]
): string {
  if (keys.length === 0) return '';
  const label = CATEGORY_LABELS[category];
  const lines = keys.map((k) => `  - ${k}`);
  return `[${label}]\n${lines.join('\n')}`;
}

export function formatClassifyResult(
  classified: ClassifiedEnvMap,
  name = 'env'
): string {
  const groups = groupByCategory(classified);
  const sections: string[] = [];

  for (const [cat, keys] of Object.entries(groups) as [EnvCategory, string[]][]) {
    const section = formatCategorySection(cat, keys);
    if (section) sections.push(section);
  }

  const total = Object.keys(classified).length;
  const header = `Classification: ${name} (${total} keys)`;
  return [header, ...sections].join('\n\n');
}

export function countCategoryStats(
  classified: ClassifiedEnvMap
): Record<EnvCategory, number> {
  const groups = groupByCategory(classified);
  const stats = {} as Record<EnvCategory, number>;
  for (const [cat, keys] of Object.entries(groups) as [EnvCategory, string[]][]) {
    stats[cat] = keys.length;
  }
  return stats;
}

export function formatMultipleClassifyResults(
  results: Record<string, ClassifiedEnvMap>
): string {
  return Object.entries(results)
    .map(([name, classified]) => formatClassifyResult(classified, name))
    .join('\n\n' + '='.repeat(40) + '\n\n');
}
