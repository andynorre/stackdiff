export type MaskOptions = {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
};

const DEFAULT_OPTIONS: Required<MaskOptions> = {
  char: '*',
  visibleStart: 0,
  visibleEnd: 0,
  minLength: 3,
};

export function maskString(value: string, options: MaskOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const len = value.length;

  if (len < opts.minLength) {
    return opts.char.repeat(len);
  }

  const start = value.slice(0, opts.visibleStart);
  const end = opts.visibleEnd > 0 ? value.slice(-opts.visibleEnd) : '';
  const masked = opts.char.repeat(len - opts.visibleStart - opts.visibleEnd);

  return `${start}${masked}${end}`;
}

export function maskEnvMap(
  env: Record<string, string>,
  keys: string[],
  options: MaskOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  const keySet = new Set(keys.map((k) => k.toUpperCase()));

  for (const [key, value] of Object.entries(env)) {
    result[key] = keySet.has(key.toUpperCase())
      ? maskString(value, options)
      : value;
  }

  return result;
}

export function maskMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  keys: string[],
  options: MaskOptions = {}
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [name, env] of Object.entries(envMaps)) {
    result[name] = maskEnvMap(env, keys, options);
  }
  return result;
}

export function listMaskedKeys(
  original: Record<string, string>,
  masked: Record<string, string>
): string[] {
  return Object.keys(original).filter((k) => original[k] !== masked[k]);
}
