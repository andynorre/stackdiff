import { describe, it, expect } from "vitest";
import {
  invertEnvMap,
  invertMultipleEnvMaps,
  hasInvertIssues,
} from "./invertEnvMap";

describe("invertEnvMap", () => {
  it("swaps keys and values in a simple map", () => {
    const env = { FOO: "bar", BAZ: "qux" };
    const { inverted } = invertEnvMap(env);
    expect(inverted).toEqual({ bar: "FOO", qux: "BAZ" });
  });

  it("skips keys with empty values by default", () => {
    const env = { FOO: "bar", EMPTY: "", SPACES: "   " };
    const { inverted, skipped } = invertEnvMap(env);
    expect(inverted).toEqual({ bar: "FOO" });
    expect(skipped).toContain("EMPTY");
    expect(skipped).toContain("SPACES");
  });

  it("does not skip empty values when skipEmpty is false", () => {
    const env = { FOO: "", BAR: "val" };
    const { inverted, skipped } = invertEnvMap(env, { skipEmpty: false });
    expect(inverted[""]).toBe("FOO");
    expect(skipped).toHaveLength(0);
  });

  it("handles collisions with onCollision=first (default)", () => {
    const env = { A: "same", B: "same" };
    const { inverted, collisions } = invertEnvMap(env, { onCollision: "first" });
    expect(inverted["same"]).toBe("A");
    expect(collisions).toHaveLength(1);
    expect(collisions[0].originalKey).toBe("B");
  });

  it("handles collisions with onCollision=last", () => {
    const env = { A: "same", B: "same" };
    const { inverted, collisions } = invertEnvMap(env, { onCollision: "last" });
    expect(inverted["same"]).toBe("B");
    expect(collisions).toHaveLength(1);
    expect(collisions[0].originalKey).toBe("B");
  });

  it("returns empty inverted map for empty input", () => {
    const { inverted, collisions, skipped } = invertEnvMap({});
    expect(inverted).toEqual({});
    expect(collisions).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe("invertMultipleEnvMaps", () => {
  it("inverts multiple named maps", () => {
    const maps = {
      dev: { FOO: "bar" },
      prod: { BAZ: "qux" },
    };
    const results = invertMultipleEnvMaps(maps);
    expect(results.dev.inverted).toEqual({ bar: "FOO" });
    expect(results.prod.inverted).toEqual({ qux: "BAZ" });
  });
});

describe("hasInvertIssues", () => {
  it("returns false when no collisions or skipped", () => {
    const result = invertEnvMap({ A: "x", B: "y" });
    expect(hasInvertIssues(result)).toBe(false);
  });

  it("returns true when there are skipped keys", () => {
    const result = invertEnvMap({ A: "" });
    expect(hasInvertIssues(result)).toBe(true);
  });

  it("returns true when there are collisions", () => {
    const result = invertEnvMap({ A: "v", B: "v" });
    expect(hasInvertIssues(result)).toBe(true);
  });
});
