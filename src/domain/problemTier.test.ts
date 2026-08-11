import { describe, expect, it } from "vitest";
import { formatProblemTier, parseProblemTier } from "@/domain/problemTier";

describe("problem tiers", () => {
  it("converts Silver V to S5", () => {
    expect(formatProblemTier(parseProblemTier("Silver V"))).toBe("S5");
  });

  it("falls back to Unrated for a missing value", () => {
    expect(formatProblemTier(parseProblemTier())).toBe("UR");
  });

  it.each([
    ["Bronze I", "Bronze", 1, "Bronze I", "B1"],
    ["Gold III", "Gold", 3, "Gold III", "G3"],
    ["Ruby V", "Ruby", 5, "Ruby V", "R5"],
  ] as const)("normalizes %s into its group, level, and labels", (value, group, level, label, shortLabel) => {
    expect(parseProblemTier(value)).toMatchObject({ group, level, label, shortLabel });
  });

  it.each(["Unrated", "silver v", "Silver VI", "Unknown I"])(
    "normalizes unsupported input %s to Unrated",
    (value) => {
      expect(parseProblemTier(value)).toMatchObject({
        group: "Unrated",
        level: null,
        label: "Unrated",
        shortLabel: "UR",
      });
    },
  );
});
