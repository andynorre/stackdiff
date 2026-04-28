/**
 * Encode/decode environment variable values using base64 or URI encoding.
 */

export type EncodeFormat = 'base64' | 'uri';

export interface EncodeOptions {
  format?: EncodeFormat;
  keysOnly?: string[];
  skipEmpty?: boolean;
}

export interface EncodeResult {
  encoded: Record<string, string>;
  original: Record<string, string>;
  changedKeys: string[];
  format: EncodeFormat;
}

export function encodeValue(value: string, format: EncodeFormat): string {
  if (format === 'base64') {
    return Buffer.from(value, 'utf8').toString('base64');
  }
  return encodeURIComponent(value);
}

export function decodeValue(value: string, format: EncodeFormat): string {
  if (format === 'base64') {
    return Buffer.from(value, 'base64').toString('utf8');
  }
  return decodeURIComponent(value);
}

export function encodeEnvMap(
  env: Record<string, string>,
  options: EncodeOptions = {}
): EncodeResult {
  const { format = 'base64', keysOnly, skipEmpty = true } = options;
  const encoded: Record<string, string> = {};
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (skipEmpty && value === '') {
      encoded[key] = value;
      continue;
    }
    if (keysOnly && !keysOnly.includes(key)) {
      encoded[key] = value;
      continue;
    }
    const encodedValue = encodeValue(value, format);
    encoded[key] = encodedValue;
    if (encodedValue !== value) {
      changedKeys.push(key);
    }
  }

  return { encoded, original: env, changedKeys, format };
}

export function encodeMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: EncodeOptions = {}
): Record<string, EncodeResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [
      name,
      encodeEnvMap(env, options),
    ])
  );
}

export function hasEncodeChanges(result: EncodeResult): boolean {
  return result.changedKeys.length > 0;
}
