/**
 * sliceEnvMap — extract a subset of keys from one or more env maps
 * by providing an explicit list of keys or a key-prefix pattern.
 */

export interface SliceOptions {
  /** Explicit list of keys to keep */
  keys?: string[];
  /** Keep only keys that start with this prefix */
  prefix?: string;
  /** When true, strip the prefix from kept keys */
  stripPrefix?: boolean;
}

export interface SliceResult {
  source: string;
  original: Record<string, string>;
  sliced: Record<string, string>;
  kept: string[];
  dropped: string[];
}

export function sliceEnvMap(
  source: string,
  env: Record<string, string>,
  options: SliceOptions
): SliceResult {
  const { keys, prefix, stripPrefix = false } = options;

  const sliced: Record<string, string> = {};
  const kept: string[] = [];
  const dropped: string[] = [];

  for (const [k, v] of Object.entries(env)) {
    let include = false;
    let outputKey = k;

    if (keys && keys.includes(k)) {
      include = true;
    } else if (prefix && k.startsWith(prefix)) {
      include = true;
      if (stripPrefix) {
        outputKey = k.slice(prefix.length);
      }
    }

    if (include) {
      sliced[outputKey] = v;
      kept.push(k);
    } else {
      dropped.push(k);
    }
  }

  return { source, original: env, sliced, kept, dropped };
}

export function sliceMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: SliceOptions
): SliceResult[] {
  return Object.entries(envMaps).map(([source, env]) =>
    sliceEnvMap(source, env, options)
  );
}

export function hasSliceResults: SliceResult): boolean {
  return result.kept.length > 0;
}
