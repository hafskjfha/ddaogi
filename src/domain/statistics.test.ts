import { describe, expect, it } from "vitest";
import { quantile } from "@/domain/statistics";

describe("quantile", () => {
  it("uses linear interpolation and ignores input order", () => {
    expect(quantile([2400, 1200, 1800, 1400], 0.25)).toBe(1350);
  });

  it("returns null for an empty collection", () => {
    expect(quantile([], 0.5)).toBeNull();
  });

  it("returns the minimum and maximum at the percentile endpoints", () => {
    expect(quantile([40, 10, 20], 0)).toBe(10);
    expect(quantile([40, 10, 20], 1)).toBe(40);
  });

  it("does not reorder the caller's values while calculating", () => {
    const values = [40, 10, 20];

    quantile(values, 0.5);

    expect(values).toEqual([40, 10, 20]);
  });

  it.each([-0.01, 1.01])("rejects an out-of-range percentile of %f", (percentile) => {
    expect(() => quantile([10, 20], percentile)).toThrow(RangeError);
  });
});
