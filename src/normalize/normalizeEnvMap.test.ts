import { describe, it, expect } from "vitest";
import {
  normalizeEnvMap,
  normalizeMultipleEnvMaps,
  hasNormalizeChanges,
} from "./normalizeEnvMap";

describe("normalizeEnvMap", () => {
  it("returns unchanged map when no options set", () => {
    const env = { KEY: "value", OTHER: "123" };
    const result = normalizeEnvMap("test", env);
    expect(result.normalized).toEqual({ KEY: "value", OTHER: "123" });
    expect(result.changes).toHaveLength(0);
  });

  it("trims whitespace from values by default", () => {
    const env = { KEY: "  hello  ", OTHER: "world" };
    const result = normalizeEnvMap("test", env);
    expect(result.normalized.KEY).toBe("hello");
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].reason).toBe("trimmed whitespace");
  });

  it("uppercases keys when option enabled", () => {
    const env = { myKey: "value", other_key: "123" };
    const result = normalizeEnvMap("test", env, { uppercaseKeys: true });
    expect(result.normalized).toHaveProperty("MYKEY");
    expect(result.normalized).toHaveProperty("OTHER_KEY");
    expect(result.normalized).not.toHaveProperty("myKey");
  });

  it("removes empty values when removeEmpty is true", () => {
    const env = { KEY: "value", EMPTY: "" };
    const result = normalizeEnvMap("test", env, { removeEmpty: true });
    expect(result.normalized).not.toHaveProperty("EMPTY");
    expect(result.changes[0].reason).toBe("empty value removed");
  });

  it("collapses internal whitespace when option enabled", () => {
    const env = { KEY: "hello   world" };
    const result = normalizeEnvMap("test", env, { collapseWhitespace: true });
    expect(result.normalized.KEY).toBe("hello world");
    expect(result.changes[0].reason).toBe("collapsed whitespace");
  });

  it("lowercases values when option enabled", () => {
    const env = { KEY: "HelloWorld" };
    const result = normalizeEnvMap("test", env, { lowercaseValues: true });
    expect(result.normalized.KEY).toBe("helloworld");
  });

  it("preserves source name in result", () => {
    const result = normalizeEnvMap(".env.production", { KEY: "val" });
    expect(result.source).toBe(".env.production");
  });
});

describe("normalizeMultipleEnvMaps", () => {
  it("normalizes multiple env maps", () => {
    const maps = {
      staging: { KEY: "  val  " },
      production: { KEY: "clean" },
    };
    const results = normalizeMultipleEnvMaps(maps);
    expect(results).toHaveLength(2);
    expect(results[0].normalized.KEY).toBe("val");
    expect(results[1].normalized.KEY).toBe("clean");
  });
});

describe("hasNormalizeChanges", () => {
  it("returns true when changes exist", () => {
    const result = normalizeEnvMap("test", { KEY: "  spaced  " });
    expect(hasNormalizeChanges(result)).toBe(true);
  });

  it("returns false when no changes", () => {
    const result = normalizeEnvMap("test", { KEY: "clean" });
    expect(hasNormalizeChanges(result)).toBe(false);
  });
});
