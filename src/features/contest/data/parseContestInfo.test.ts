import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/contest_info.md"), "utf8");

describe("parseContestInfo", () => {
  it("parses the contest metadata and A through I problems", () => {
    const result = parseContestInfo(markdown);

    expect(result.contest).toMatchObject({
      slug: "doj-beginner-contest-4",
      title: "DOJ Beginner Contest 4",
      problemOrder: "난이도순",
      ratedUpperBound: 2400,
      director: "admin",
      setter: "lunarlity",
      startAt: "2026-07-08T21:00:00+09:00",
      endAt: "2026-07-08T22:40:00+09:00",
      durationMinutes: 100,
      participationType: "regular",
    });
    expect(result.problems).toHaveLength(9);
    expect(result.problems[0]).toMatchObject({
      index: "A",
      title: "두 수열",
      tier: { label: "Bronze I", shortLabel: "B1" },
      firstFullHandle: "jkrt",
      firstFullTime: "0m 55s",
    });
    expect(result.problems[8]).toMatchObject({
      index: "I",
      tier: { label: "Diamond II", shortLabel: "D2" },
      firstFullHandle: null,
      firstFullTime: null,
    });
  });

  it("normalizes the window participation type without changing its schedule", () => {
    const result = parseContestInfo(markdown.replace("대회 참가 타입: 일반", "대회 참가 타입: window"));

    expect(result.contest.participationType).toBe("window");
    expect(result.contest.durationMinutes).toBe(100);
    expect(result.contest.startAt).toBe("2026-07-08T21:00:00+09:00");
    expect(result.contest.endAt).toBe("2026-07-08T22:40:00+09:00");
  });

  it.each([
    ["duplicate problem index", markdown.replace("### B,", "### A,")],
    ["missing difficulty", markdown.replace("- 난이도: B1\r\n", "")],
    ["missing title", markdown.replace("### A, 두 수열", "### A, ")],
    ["fewer than nine problems", markdown.replace(/### I,[\s\S]*$/, "")],
    ["invalid calendar time", markdown.replace("2026년 7월 8일 오후 9:00", "2026년 2월 30일 오후 9:00")],
  ])("rejects %s with a source-naming error", (_case, invalidMarkdown) => {
    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md/);
  });
});
