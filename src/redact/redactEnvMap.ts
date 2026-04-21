export type RedactOptions = {
  placeholder?: string;
  keys?: string[];
  patterns?: RegExp[];
};

export type RedactResult = {
  original: Record<string, string>;
  redacted: Record<string, string>;
  redactedKeys: string[];
};

const DEFAULT_PLACEHOLDER = "[REDACTED]";

const DEFAULT_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /signing/i,
];

export function shouldRedact(
  key: string,
  options: RedactOptions = {}
): boolean {
  const { keys = [], patterns = DEFAULT_PATTERNS } = options;
  if (keys.includes(key)) return true;
  return patterns.some((pattern) => pattern.test(key));
}

export function redactEnvMap(
  env: Record<string, string>,
  options: RedactOptions = {}
): RedactResult {
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  const redacted: Record<string, string> = {};
  const redactedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (shouldRedact(key, options)) {
      redacted[key] = placeholder;
      redactedKeys.push(key);
    } else {
      redacted[key] = value;
    }
  }

  return { original: env, redacted, redactedKeys };
}

export function redactMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: RedactOptions = {}
): Record<string, RedactResult> {
  const results: Record<string, RedactResult> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    results[name] = redactEnvMap(env, options);
  }
  return results;
}

/**
 * Returns a summary of how many keys were redacted across all env maps.
 * Useful for logging or auditing redaction activity.
 */
export function summarizeRedaction(
  results: Record<string, RedactResult>
): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const [name, result] of Object.entries(results)) {
    summary[name] = result.redactedKeys.length;
  }
  return summary;
}
