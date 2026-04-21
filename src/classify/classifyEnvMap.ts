export type EnvCategory = 'database' | 'auth' | 'network' | 'feature_flag' | 'logging' | 'cache' | 'storage' | 'other';

export interface ClassifiedEntry {
  key: string;
  value: string;
  category: EnvCategory;
}

export type ClassifiedEnvMap = Record<string, ClassifiedEntry>;

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: EnvCategory }> = [
  { pattern: /^(DB_|DATABASE_|POSTGRES_|MYSQL_|MONGO_|REDIS_URL|PG_)/i, category: 'database' },
  { pattern: /^(AUTH_|JWT_|SECRET|PASSWORD|TOKEN|API_KEY|OAUTH_|SESSION_)/i, category: 'auth' },
  { pattern: /^(HOST|PORT|URL|ENDPOINT|BASE_URL|API_URL|CORS_|ALLOWED_ORIGINS)/i, category: 'network' },
  { pattern: /^(FEATURE_|FLAG_|ENABLE_|DISABLE_|FF_)/i, category: 'feature_flag' },
  { pattern: /^(LOG_|LOGGING_|DEBUG|VERBOSE|SENTRY_|DATADOG_)/i, category: 'logging' },
  { pattern: /^(CACHE_|MEMCACHED_|REDIS_(?!URL))/i, category: 'cache' },
  { pattern: /^(S3_|STORAGE_|BUCKET_|GCS_|AZURE_BLOB_|CDN_)/i, category: 'storage' },
];

export function classifyKey(key: string): EnvCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(key)) {
      return category;
    }
  }
  return 'other';
}

export function classifyEnvMap(
  env: Record<string, string>
): ClassifiedEnvMap {
  const result: ClassifiedEnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = { key, value, category: classifyKey(key) };
  }
  return result;
}

export function classifyMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>
): Record<string, ClassifiedEnvMap> {
  const result: Record<string, ClassifiedEnvMap> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    result[name] = classifyEnvMap(env);
  }
  return result;
}

export function groupByCategory(
  classified: ClassifiedEnvMap
): Record<EnvCategory, string[]> {
  const groups = {} as Record<EnvCategory, string[]>;
  for (const entry of Object.values(classified)) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push(entry.key);
  }
  return groups;
}
