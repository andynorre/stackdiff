import { parseCliOptions } from './options';
import { parseMultipleEnvFiles } from '../parser';
import { diffEnvMaps, hasDifferences } from '../diff';
import { formatDiff } from '../diff';

export async function run(argv: string[]): Promise<void> {
  const options = parseCliOptions(argv);

  let envMaps: Map<string, Record<string, string>>;
  try {
    envMaps = await parseMultipleEnvFiles(options.files);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error reading files: ${message}`);
    process.exit(1);
  }

  const result = diffEnvMaps(envMaps, {
    ignoreValues: options.ignoreValues,
    onlyMissing: options.onlyMissing,
  });

  if (!hasDifferences(result)) {
    console.log('No differences found.');
    process.exit(0);
  }

  if (options.output === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatDiff(result));
  }

  process.exit(1);
}
