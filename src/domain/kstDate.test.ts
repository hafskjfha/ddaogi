import { describe, expect, it } from "vitest";
import { toKstIsoDate } from "@/domain/kstDate";

describe("toKstIsoDate", () => {
  it("keeps a UTC timestamp before the KST rollover on the same calendar date", () => {
    expect(toKstIsoDate("2026-07-08T14:59:59.000Z")).toBe("2026-07-08");
  });

  it("moves a UTC timestamp at the KST rollover to the next calendar date", () => {
    expect(toKstIsoDate("2026-07-08T15:00:00.000Z")).toBe("2026-07-09");
  });

  it("rejects an invalid timestamp", () => {
    expect(() => toKstIsoDate("not-a-timestamp")).toThrow(TypeError);
  });

  it("rejects an ISO UTC timestamp whose calendar day does not exist", () => {
    expect(() => toKstIsoDate("2026-02-30T00:00:00.000Z")).toThrow(TypeError);
  });
});
