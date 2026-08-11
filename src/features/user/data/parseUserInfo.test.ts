import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseUserInfo } from "@/features/user/data/parseUserInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/user_info.md"), "utf8");

describe("parseUserInfo", () => {
  it("parses the jtw7913 profile and both contest tables", () => {
    const result = parseUserInfo(markdown);

    expect(result.profile).toMatchObject({
      currentRating: 1429,
      maxRating: 1429,
      ratingRank: 89,
      ratingPercentile: 31.3,
      solvedRank: 9,
      podiumCount: 0,
      firstPlaceCount: 0,
      firstFullCount: 0,
    });
    expect(result.participations).toHaveLength(8);
    expect(result.contestCalendar).toHaveLength(22);
  });

  it("normalizes dates and nullable rating values without treating the initial rating as a contest", () => {
    const result = parseUserInfo(markdown);

    expect(result.initialRating).toBe(1200);
    expect(result.participations[0]).toEqual({
      date: "2026-06-07",
      name: "67 Contest",
      rank: 11,
      performanceRating: null,
      ratingDiff: null,
      rated: false,
    });
    expect(result.contestCalendar[0]).toEqual({
      index: 1,
      date: "2026-05-05",
      name: "DOJ Contest 1",
      participated: false,
    });
    expect(result.participations[4]?.name).toBe("아니메컵 3기 ~2시에 코딩을 하는 건 이상해!~");
  });

  it("identifies user_info.md when an expected section is missing", () => {
    expect(() => parseUserInfo(markdown.replace("## 참여 대회 정보", "## 다른 정보"))).toThrow(
      /user_info\.md.*참여 대회 정보/,
    );
  });

  it("identifies user_info.md when an expected table header is missing", () => {
    const missingHeader = markdown.replace(
      "|날짜|대회명|랭킹|퍼포먼스레이팅|diff|기타|",
      "|date|contest|rank|performance|diff|note|",
    );

    expect(() => parseUserInfo(missingHeader)).toThrow(/user_info\.md.*table header/i);
  });

  it("rejects a table row whose width does not match its expected header", () => {
    const malformed = markdown.replace(
      "|2026.6.7|67 Contest|11|-|-|언레 대회|",
      "|2026.6.7|67 Contest|11|-|-|언레 대회|unexpected|",
    );

    expect(() => parseUserInfo(malformed)).toThrow(/user_info\.md.*columns/i);
  });

  it("matches participation by date and name when calendar names repeat", () => {
    const duplicateName = markdown.replace(
      "| 2026년 5월 5일 오후 12:00 | DOJ Contest 1 |",
      "| 2026년 5월 5일 오후 12:00 | 67 Contest |",
    );
    const result = parseUserInfo(duplicateName);

    expect(result.contestCalendar[0].participated).toBe(false);
    expect(
      result.contestCalendar.find((entry) => entry.date === "2026-06-07")?.participated,
    ).toBe(true);
  });

  it.each([
    ["대회 1등: 0번", /user_info\.md.*first-place count/i],
    ["만점 문제 랭킹: 9등", /user_info\.md.*solved rank/i],
  ] as const)("requires the explicit source fact %s", (sourceLine, expectedError) => {
    expect(() => parseUserInfo(markdown.replace(sourceLine, ""))).toThrow(expectedError);
  });
});
