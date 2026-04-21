import { describe, it, expect } from "vitest";
import {
  shouldRedact,
  redactEnvMap,
  redactMultipleEnvMaps,
} from "./redactEnvMap";

describe("shouldRedact", () => {
  it("returns true for keys matching default patterns", () => {
    expect(shouldRedact("DB_PASSWORD")).toBe(true);
    expect(shouldRedact("API_KEY")).toBe(true);
    expect(shouldRedact("AUTH_TOKEN")).toBe(true);
    expect(shouldRedact("SECRET_VALUE")).toBe(true);
  });

  it("returns false for non-sensitive keys", () => {
    expect(shouldRedact("NODE_ENV")).toBe(false);
    expect(shouldRedact("PORT")).toBe(false);
    expect(shouldRedact("APP_NAME")).toBe(false);
  });

  it("returns true for explicitly listed keys", () => {
    expect(shouldRedact("CUSTOM_KEY", { keys: ["CUSTOM_KEY"] })).toBe(true);
  });

  it("uses custom patterns when provided", () => {
    expect(shouldRedact("DB_HOST", { patterns: [/db/i] })).toBe(true);
    expect(shouldRedact("API_KEY", { patterns: [/db/i] })).toBe(false);
  });
});

describe("redactEnvMap", () => {
  const env = {
    NODE_ENV: "production",
    DB_PASSWORD: "supersecret",
    API_KEY: "abc123",
    PORT: "3000",
  };

  it("redacts sensitive keys with default placeholder", () => {
    const result = redactEnvMap(env);
    expect(result.redacted["DB_PASSWORD"]).toBe("[REDACTED]");
    expect(result.redacted["API_KEY"]).toBe("[REDACTED]");
    expect(result.redacted["NODE_ENV"]).toBe("production");
    expect(result.redacted["PORT"]).toBe("3000");
  });

  it("uses custom placeholder", () => {
    const result = redactEnvMap(env, { placeholder: "***" });
    expect(result.redacted["DB_PASSWORD"]).toBe("***");
  });

  it("tracks redacted keys", () => {
    const result = redactEnvMap(env);
    expect(result.redactedKeys).toContain("DB_PASSWORD");
    expect(result.redactedKeys).toContain("API_KEY");
    expect(result.redactedKeys).not.toContain("PORT");
  });

  it("preserves original env map unchanged", () => {
    const result = redactEnvMap(env);
    expect(result.original["DB_PASSWORD"]).toBe("supersecret");
  });
});

describe("redactMultipleEnvMaps", () => {
  it("redacts across multiple env maps", () => {
    const maps = {
      dev: { PORT: "3000", API_KEY: "dev-key" },
      prod: { PORT: "8080", API_KEY: "prod-key" },
    };
    const results = redactMultipleEnvMaps(maps);
    expect(results["dev"].redacted["API_KEY"]).toBe("[REDACTED]");
    expect(results["prod"].redacted["API_KEY"]).toBe("[REDACTED]");
    expect(results["dev"].redacted["PORT"]).toBe("3000");
  });
});
