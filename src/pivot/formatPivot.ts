import type { PivotResult, PivotRow } from "./pivotEnvMaps";

const COL_KEY = 14;
const COL_VAL = 20;

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len - 1) + "…" : str.padEnd(len);
}

function formatHeader(sources: string[]): string {
  const keyCol = pad("KEY", COL_KEY);
  const sourceCols = sources.map((s) => pad(s, COL_VAL)).join(" | ");
  const header = `${keyCol} | ${sourceCols}`;
  const divider = "-".repeat(header.length);
  return `${header}\n${divider}`;
}

function formatRow(row: PivotRow, sources: string[]): string {
  const keyCol = pad(row.key, COL_KEY);
  const valueCols = sources
    .map((s) => {
      const val = row.sources[s];
      return pad(val === undefined ? "(missing)" : val, COL_VAL);
    })
    .join(" | ");
  return `${keyCol} | ${valueCols}`;
}

export function formatPivotTable(result: PivotResult): string {
  if (result.rows.length === 0) {
    return "(no keys to display)";
  }
  const lines: string[] = [
    formatHeader(result.sources),
    ...result.rows.map((row) => formatRow(row, result.sources)),
  ];
  return lines.join("\n");
}

export function formatPivotSummary(result: PivotResult): string {
  const total = result.rows.length;
  const missing = result.rows.filter((r) =>
    Object.values(r.sources).some((v) => v === undefined)
  ).length;
  const differing = result.rows.filter((r) => {
    const vals = Object.values(r.sources);
    return vals.some((v) => v !== vals[0]);
  }).length;

  return [
    `Sources : ${result.sources.join(", ")}`,
    `Total keys : ${total}`,
    `Keys with differences : ${differing}`,
    `Keys with missing values : ${missing}`,
  ].join("\n");
}
