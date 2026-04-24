export type SampleStrategy = 'first' | 'last' | 'random' | 'nth';

export interface SampleOptions {
  count?: number;
  strategy?: SampleStrategy;
  nth?: number;
  seed?: number;
}

export interface SampleResult {
  sampled: Record<string, string>;
  total: number;
  selected: number;
  strategy: SampleStrategy;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleEnvMap(
  env: Record<string, string>,
  options: SampleOptions = {}
): SampleResult {
  const { count = 5, strategy = 'first', nth = 2, seed = 42 } = options;
  const keys = Object.keys(env);
  const total = keys.length;
  let selectedKeys: string[];

  if (strategy === 'first') {
    selectedKeys = keys.slice(0, count);
  } else if (strategy === 'last') {
    selectedKeys = keys.slice(-count);
  } else if (strategy === 'nth') {
    selectedKeys = keys.filter((_, i) => i % nth === 0).slice(0, count);
  } else {
    const rand = seededRandom(seed);
    const shuffled = [...keys].sort(() => rand() - 0.5);
    selectedKeys = shuffled.slice(0, count);
  }

  const sampled: Record<string, string> = {};
  for (const key of selectedKeys) {
    sampled[key] = env[key];
  }

  return { sampled, total, selected: selectedKeys.length, strategy };
}

export function sampleMultipleEnvMaps(
  envMaps: Record<string, Record<string, string>>,
  options: SampleOptions = {}
): Record<string, SampleResult> {
  return Object.fromEntries(
    Object.entries(envMaps).map(([name, env]) => [name, sampleEnvMap(env, options)])
  );
}

export function hasSampleResults(result: SampleResult): boolean {
  return result.selected > 0;
}
