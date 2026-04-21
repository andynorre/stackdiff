import { describe, it, expect } from "vitest";
import { pivotEnvMaps } from "./pivotEnvMaps";
import { formatPivotTable, formatPivotSummary } from "./formatPivot";

const staging = { API_URL: "https://staging.api", DB_HOST: "staging-db" };
const production = { API_URL: "https://prod.api", DB_HOST: "prod-db", SECRET: "s3cr3t" };

describe("formatPivotTable", () => {
  it("includes all source names in the header", () => {
    const result = pivotEnvMaps({ staging, production });
    const table = formatPivotTable(result);
    expect(table).toContain("staging");
    expect(table).toContain("production");
  });

  it("includes all keys in the output", () => {
    const result = pivotEnvMaps({ staging, production });
    const table = formatPivotTable(result);
    expect(table).toContain("API_URL");
    expect(table).toContain("DB_HOST");
    expect(table).toContain("SECRET");
  });

  it("shows (missing) for absent keys", () => {
    const result = pivotEnvMaps({ staging, production });
    const table = formatPivotTable(result);
    expect(table).toContain("(missing)");
  });

  it("returns placeholder when no rows", () => {
    const result = pivotEnvMaps({});
    expect(formatPivotTable(result)).toBe("(no keys to display)");
  });
});

describe("formatPivotSummary", () => {
  it("reports total key count", () => {
    const result = pivotEnvMaps({ staging, production });
    const summary = formatPivotSummary(result);
    expect(summary).toContain("Total keys : 3");
  });

  it("reports differing key count", () => {
    const result = pivotEnvMaps({ staging, production });
    const summary = formatPivotSummary(result);
    expect(summary).toContain("Keys with differences : 2");
  });

  it("reports missing key count", () => {
    const result = pivotEnvMaps({ staging, production });
    const summary = formatPivotSummary(result);
    expect(summary).toContain("Keys with missing values : 1");
  });

  it("lists source names", () => {
    const result = pivotEnvMaps({ staging, production });
    const summary = formatPivotSummary(result);
    expect(summary).toContain("staging");
    expect(summary).toContain("production");
  });
});
