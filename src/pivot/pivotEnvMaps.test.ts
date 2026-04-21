import { describe, it, expect } from "vitest";
import {
  pivotEnvMaps,
  pivotDiffOnly,
  pivotMissingOnly,
} from "./pivotEnvMaps";

const staging = { API_URL: "https://staging.api", DB_HOST: "staging-db", DEBUG: "true" };
const production = { API_URL: "https://prod.api", DB_HOST: "prod-db", SECRET: "s3cr3t" };
const local = { API_URL: "http://localhost", DB_HOST: "localhost", DEBUG: "true" };

describe("pivotEnvMaps", () => {
  it("collects all unique keys", () => {
    const result = pivotEnvMaps({ staging, production });
    const keys = result.rows.map((r) => r.key);
    expect(keys).toContain("API_URL");
    expect(keys).toContain("DB_HOST");
    expect(keys).toContain("DEBUG");
    expect(keys).toContain("SECRET");
  });

  it("records source names", () => {
    const result = pivotEnvMaps({ staging, production });
    expect(result.sources).toEqual(["staging", "production"]);
  });

  it("marks missing values as undefined", () => {
    const result = pivotEnvMaps({ staging, production });
    const secretRow = result.rows.find((r) => r.key === "SECRET");
    expect(secretRow?.sources["staging"]).toBeUndefined();
    expect(secretRow?.sources["production"]).toBe("s3cr3t");
  });

  it("sorts rows alphabetically by key", () => {
    const result = pivotEnvMaps({ staging, production });
    const keys = result.rows.map((r) => r.key);
    expect(keys).toEqual([...keys].sort());
  });

  it("handles empty maps", () => {
    const result = pivotEnvMaps({ a: {}, b: {} });
    expect(result.rows).toHaveLength(0);
  });
});

describe("pivotDiffOnly", () => {
  it("returns only rows with differing values", () => {
    const result = pivotEnvMaps({ staging, local });
    const diff = pivotDiffOnly(result);
    const keys = diff.rows.map((r) => r.key);
    expect(keys).toContain("API_URL");
    expect(keys).toContain("DB_HOST");
    expect(keys).not.toContain("DEBUG");
  });
});

describe("pivotMissingOnly", () => {
  it("returns only rows with at least one missing value", () => {
    const result = pivotEnvMaps({ staging, production });
    const missing = pivotMissingOnly(result);
    const keys = missing.rows.map((r) => r.key);
    expect(keys).toContain("DEBUG");
    expect(keys).toContain("SECRET");
    expect(keys).not.toContain("API_URL");
    expect(keys).not.toContain("DB_HOST");
  });
});
