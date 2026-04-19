import { describe, it, expect } from "vitest";
import {
  isSecret,
  maskValue,
  filterEnvMap,
  filterMultipleEnvMaps,
} from "./filterKeys";

describe("isSecret", () => {
  it("detects secret keys", () => {
    expect(isSecret("DB_PASSWORD")).toBe(true);
    expect(isSecret("API_KEY")).toBe(true);
    expect(isSecret("AUTH_TOKEN")).toBe(true);
    expect(isSecret("PRIVATE_KEY")).toBe(true);
  });

  it("does not flag non-secret keys", () => {
    expect(isSecret("APP_ENV")).toBe(false);
    expect(isSecret("PORT")).toBe(false);
    expect(isSecret("DATABASE_URL")).toBe(false);
  });
});

describe("maskValue", () => {
  it("masks long values", () => {
    expect(maskValue("supersecret123")).toBe("su****23");
  });

  it("masks short values entirely", () => {
    expect(maskValue("abc")).toBe("****");
  });
});

describe("filterEnvMap", () => {
  const env = { PORT: "3000", DB_PASSWORD: "s3cr3t", APP_ENV: "production" };

  it("returns all keys with no options", () => {
    expect(filterEnvMap(env)).toEqual(env);
  });

  it("filters by include list", () => {
    expect(filterEnvMap(env, { include: ["PORT"] })).toEqual({ PORT: "3000" });
  });

  it("filters by exclude list", () => {
    const result = filterEnvMap(env, { exclude: ["DB_PASSWORD"] });
    expect(result).not.toHaveProperty("DB_PASSWORD");
  });

  it("masks secret values when maskSecrets is true", () => {
    const result = filterEnvMap(env, { maskSecrets: true });
    expect(result["DB_PASSWORD"]).toBe("s3****3t");
    expect(result["PORT"]).toBe("3000");
  });
});

describe("filterMultipleEnvMaps", () => {
  it("applies filter to all maps", () => {
    const maps = {
      staging: { PORT: "3000", SECRET_KEY: "abc123" },
      prod: { PORT: "8080", SECRET_KEY: "xyz789" },
    };
    const result = filterMultipleEnvMaps(maps, { maskSecrets: true });
    expect(result.staging["SECRET_KEY"]).toBe("ab****23");
    expect(result.prod["PORT"]).toBe("8080");
  });
});
