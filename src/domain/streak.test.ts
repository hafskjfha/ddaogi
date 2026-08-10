import { describe, expect, it } from "vitest";
import { calculateDailyStreak, calculateSequenceStreak } from "@/domain/streak";

describe("streak calculations", () => {
  it("counts consecutive contest indices", () => {
    expect(calculateSequenceStreak([false, true, true, false, true])).toEqual({
      current: 1,
      longest: 2,
    });
  });

  it("counts calendar days ending at the supplied as-of date", () => {
    expect(
      calculateDailyStreak(["2026-08-01", "2026-08-02", "2026-08-04"], "2026-08-04"),
    ).toEqual({ current: 1, longest: 2 });
  });

  it("returns a zero current daily streak when as-of is not active", () => {
    expect(calculateDailyStreak(["2026-08-01", "2026-08-02"], "2026-08-03")).toEqual({
      current: 0,
      longest: 2,
    });
  });

  it("deduplicates unsorted daily activity before finding runs", () => {
    expect(
      calculateDailyStreak(
        ["2026-08-03", "2026-08-01", "2026-08-02", "2026-08-02"],
        "2026-08-03",
      ),
    ).toEqual({ current: 3, longest: 3 });
  });

  it("ignores invalid activity dates instead of rolling them into a real day", () => {
    expect(calculateDailyStreak(["2026-02-30", "2026-03-03"], "2026-03-03")).toEqual({
      current: 1,
      longest: 1,
    });
  });

  it("treats an invalid as-of date as inactive", () => {
    expect(calculateDailyStreak(["2026-08-01"], "not-a-date")).toEqual({ current: 0, longest: 1 });
  });

  it("returns empty streaks when no sequence values are active", () => {
    expect(calculateSequenceStreak([false, false])).toEqual({ current: 0, longest: 0 });
  });
});
