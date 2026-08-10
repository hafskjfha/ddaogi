import { describe, expect, it } from "vitest";
import { getRatingBand } from "@/domain/rating";

describe("getRatingBand", () => {
  it.each([
    [1199, "NEWBIE"],
    [1200, "PUPIL"],
    [1399, "PUPIL"],
    [1400, "SPECIALIST"],
    [2399, "INTERNATIONAL_MASTER"],
    [2400, "GRANDMASTER"],
  ] as const)("maps %i to %s", (rating, title) => {
    expect(getRatingBand(rating).title).toBe(title);
  });

  it.each([
    [-10, "NEWBIE", "rgb(100, 116, 139)"],
    [1599, "SPECIALIST", "rgb(20, 184, 166)"],
    [1600, "EXPERT", "rgb(59, 130, 246)"],
    [1799, "EXPERT", "rgb(59, 130, 246)"],
    [1800, "CANDIDATE_MASTER", "rgb(139, 92, 246)"],
    [1999, "CANDIDATE_MASTER", "rgb(139, 92, 246)"],
    [2000, "MASTER", "rgb(249, 115, 22)"],
    [2199, "MASTER", "rgb(249, 115, 22)"],
    [2200, "INTERNATIONAL_MASTER", "rgb(239, 68, 68)"],
  ] as const)("normalizes and maps %i to the %s band", (rating, title, color) => {
    expect(getRatingBand(rating)).toMatchObject({ title, color });
  });
});
