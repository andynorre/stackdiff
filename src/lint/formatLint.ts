import type { LintResult, LintIssue, LintSeverity } from './lintEnvMap';

const SEVERITY_ICONS: Record<LintSeverity, string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

function formatIssue(issue: LintIssue): string {
  const icon = SEVERITY_ICONS[issue.severity];
  return `  ${icon} [${issue.severity.toUpperCase()}] ${issue.message} (${issue.rule})`;
}

export function formatLintResult(result: LintResult): string {
  const lines: string[] = [`Lint results for: ${result.source}`];

  if (result.issues.length === 0) {
    lines.push('  ✔ No issues found');
  } else {
    for (const issue of result.issues) {
      lines.push(formatIssue(issue));
    }
    lines.push('');
    lines.push(
      `  Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s), ` +
      `${result.issues.filter(i => i.severity === 'info').length} info(s)`
    );
  }

  return lines.join('\n');
}

export function formatMultipleLintResults(
  results: Record<string, LintResult>
): string {
  const sections = Object.values(results).map(formatLintResult);
  const total = Object.values(results).reduce(
    (acc, r) => ({ errors: acc.errors + r.errorCount, warnings: acc.warnings + r.warningCount }),
    { errors: 0, warnings: 0 }
  );

  sections.push(`\nTotal: ${total.errors} error(s), ${total.warnings} warning(s) across ${Object.keys(results).length} file(s)`);
  return sections.join('\n\n');
}

export function countLintStats(result: LintResult): Record<LintSeverity, number> {
  return {
    error: result.errorCount,
    warning: result.warningCount,
    info: result.issues.filter(i => i.severity === 'info').length,
  };
}
