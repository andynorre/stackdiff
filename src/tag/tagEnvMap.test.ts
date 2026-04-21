import { describe, it, expect } from "vitest";
import {
  tagEnvMap,
  tagMultipleEnvMaps,
  hasTaggedKeys,
} from "./tagEnvMap";

const sampleEnv = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  AWS_ACCESS_KEY: "abc123",
  AWS_SECRET: "secret",
  APP_NAME: "myapp",
  DEBUG: "true",
};

const tagRules = {
  database: ["DB_"],
  aws: ["AWS_"],
  app: ["APP_"],
};

describe("tagEnvMap", () => {
  it("assigns correct tags to keys by prefix", () => {
    const result = tagEnvMap(sampleEnv, tagRules);
    expect(result.taggedKeys["DB_HOST"]).toContain("database");
    expect(result.taggedKeys["DB_PORT"]).toContain("database");
    expect(result.taggedKeys["AWS_ACCESS_KEY"]).toContain("aws");
    expect(result.taggedKeys["AWS_SECRET"]).toContain("aws");
    expect(result.taggedKeys["APP_NAME"]).toContain("app");
  });

  it("identifies untagged keys", () => {
    const result = tagEnvMap(sampleEnv, tagRules);
    expect(result.untaggedKeys).toContain("DEBUG");
    expect(result.untaggedKeys).not.toContain("DB_HOST");
  });

  it("builds inverse tag map correctly", () => {
    const result = tagEnvMap(sampleEnv, tagRules);
    expect(result.tags["database"]).toEqual(
      expect.arrayContaining(["DB_HOST", "DB_PORT"])
    );
    expect(result.tags["aws"]).toEqual(
      expect.arrayContaining(["AWS_ACCESS_KEY", "AWS_SECRET"])
    );
  });

  it("supports exact key matching", () => {
    const result = tagEnvMap(sampleEnv, { special: ["DEBUG"] });
    expect(result.taggedKeys["DEBUG"]).toContain("special");
  });

  it("returns empty tags for empty env map", () => {
    const result = tagEnvMap({}, tagRules);
    expect(result.taggedKeys).toEqual({});
    expect(result.untaggedKeys).toEqual([]);
  });
});

describe("tagMultipleEnvMaps", () => {
  it("tags multiple env maps and sets source", () => {
    const maps = { prod: sampleEnv, dev: { DEBUG: "true", DB_HOST: "devhost" } };
    const results = tagMultipleEnvMaps(maps, tagRules);
    expect(results["prod"].source).toBe("prod");
    expect(results["dev"].source).toBe("dev");
    expect(results["dev"].taggedKeys["DB_HOST"]).toContain("database");
  });
});

describe("hasTaggedKeys", () => {
  it("returns true when tagged keys exist", () => {
    const result = tagEnvMap(sampleEnv, tagRules);
    expect(hasTaggedKeys(result)).toBe(true);
  });

  it("returns false when no keys are tagged", () => {
    const result = tagEnvMap({ DEBUG: "true" }, tagRules);
    expect(hasTaggedKeys(result)).toBe(false);
  });
});
