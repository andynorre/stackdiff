import { Command } from 'commander';

export interface CliOptions {
  files: string[];
  output: 'text' | 'json';
  ignoreValues: boolean;
  onlyMissing: boolean;
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('stackdiff')
    .description('Compare environment variable sets across .env files and deployment configs')
    .version('0.1.0');

  program
    .argument('<files...>', 'Two or more .env files to compare')
    .option('-o, --output <format>', 'Output format: text or json', 'text')
    .option('--ignore-values', 'Only compare keys, not values', false)
    .option('--only-missing', 'Only show missing keys', false);

  return program;
}

export function parseCliOptions(argv: string[]): CliOptions {
  const program = buildProgram();
  program.parse(argv);

  const opts = program.opts();
  const files = program.args;

  if (files.length < 2) {
    console.error('Error: at least two files are required');
    process.exit(1);
  }

  return {
    files,
    output: opts.output === 'json' ? 'json' : 'text',
    ignoreValues: Boolean(opts.ignoreValues),
    onlyMissing: Boolean(opts.onlyMissing),
  };
}
