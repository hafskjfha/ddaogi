import difficulties from "../../../../data/difficulty.json";
import results from "../../../../data/result.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildUserDashboard } from "@/features/user/data/buildUserDashboard";
import { parseUserInfo } from "@/features/user/data/parseUserInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/user_info.md"), "utf8");
const user = parseUserInfo(markdown);
const problemTotals = {
  UR: 50,
  B5: 9,
  B4: 9,
  B3: 2,
  B2: 8,
  B1: 7,
  S5: 11,
  S4: 8,
  S3: 7,
  S2: 18,
  S1: 14,
  G5: 13,
  G4: 12,
  G3: 15,
  G2: 17,
  G1: 12,
  P5: 24,
  P4: 22,
  P3: 21,
  P2: 13,
  P1: 19,
  D5: 14,
  D4: 9,
  D3: 8,
  D2: 11,
  D1: 7,
  R5: 8,
  R4: 3,
  R3: 1,
  R2: 1,
  R1: 0,
};

describe("buildUserDashboard", () => {
  it("derives all user analytics from the supplied mock files", () => {
    const dashboard = buildUserDashboard(
      "jtw7913",
      user,
      results,
      difficulties,
      problemTotals,
    );

    expect(dashboard.profile.solvedCount).toBe(90);
    expect(dashboard.problems.filter((problem) => !problem.solved)).toHaveLength(5);
    expect(dashboard.totalSubmissions).toBe(215);
    expect(dashboard.languages.map((item) => item.count).reduce((a, b) => a + b, 0)).toBe(215);
    expect(dashboard.ratingHistory.at(-1)?.ratingAfter).toBe(1429);
    expect(dashboard.profile.firstPlaceCount).toBe(0);
    expect(dashboard.profile.solvedRank).toBe(9);
    expect(dashboard.problems.find(({ id }) => id === "65")?.tier.shortLabel).toBe("G1");
    expect(dashboard.problems.find(({ id }) => id === "94")?.tier.shortLabel).toBe("UR");
    expect(dashboard.problems.find(({ id }) => id === "298")?.tier.shortLabel).toBe("S2");
    expect(dashboard.problems.find(({ id }) => id === "348")?.tier.shortLabel).toBe("P4");
  });

  it("derives difficulty availability totals from the supplied tier totals", () => {
    const dashboard = buildUserDashboard(
      "jtw7913",
      user,
      results,
      difficulties,
      problemTotals,
    );

    expect(dashboard.difficultyGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "Bronze", totalAvailable: 35 }),
        expect.objectContaining({ key: "Silver", totalAvailable: 58 }),
        expect.objectContaining({ key: "Gold", totalAvailable: 69 }),
        expect.objectContaining({ key: "Platinum", totalAvailable: 99 }),
      ]),
    );
    expect(
      dashboard.difficultyDetails.find(({ key }) => key === "Gold I")?.totalAvailable,
    ).toBe(12);
  });

  it("normalizes submissions and uses Unrated when a difficulty is missing", () => {
    const dashboard = buildUserDashboard(
      "jtw7913",
      user,
      {
        "999": [
          {
            p_title: "Boundary Problem",
            p_maxscore: 100,
            submmit_lang: "cpp20",
            submmit_at: "2026-01-03T12:00:00.000Z",
            submmit_score: 100,
          },
          {
            p_title: "Boundary Problem",
            p_maxscore: 100,
            submmit_lang: "pypy3",
            submmit_at: "2026-01-02T12:00:00.000Z",
            submmit_score: 100,
          },
        ],
      },
      {},
      problemTotals,
    );

    expect(dashboard.problems).toEqual([
      {
        id: "999",
        title: "Boundary Problem",
        tier: {
          group: "Unrated",
          level: null,
          label: "Unrated",
          shortLabel: "UR",
          color: "#64748b",
        },
        bestScore: 100,
        maxScore: 100,
        solved: true,
        firstFullDate: "2026-01-02",
        submissions: [
          {
            language: "pypy3",
            submittedAt: "2026-01-02T12:00:00.000Z",
            score: 100,
            maxScore: 100,
          },
          {
            language: "cpp20",
            submittedAt: "2026-01-03T12:00:00.000Z",
            score: 100,
            maxScore: 100,
          },
        ],
      },
    ]);
    expect(dashboard.difficultyGroups[0]).toMatchObject({
      key: "Unrated",
      count: 1,
      totalAvailable: 50,
    });
    expect(dashboard.difficultyDetails[0]).toMatchObject({
      key: "Unrated",
      count: 1,
      totalAvailable: 50,
    });
  });

  it("accepts an evolving problem maximum and records the earliest contemporaneous full score", () => {
    const dashboard = buildUserDashboard(
      "jtw7913",
      user,
      {
        "97": [
          {
            p_title: "Evolving Maximum",
            p_maxscore: 4,
            submmit_lang: "custom-json",
            submmit_at: "2026-06-07T14:32:57.354Z",
            submmit_score: 4,
          },
          {
            p_title: "Evolving Maximum",
            p_maxscore: 1,
            submmit_lang: "custom-json",
            submmit_at: "2026-06-07T14:25:57.933Z",
            submmit_score: 1,
          },
        ],
      },
      { "97": "Unrated" },
      problemTotals,
    );

    expect(dashboard.problems[0]).toMatchObject({
      bestScore: 4,
      maxScore: 4,
      solved: true,
      firstFullDate: "2026-06-07",
    });
  });

  it("rejects malformed result and difficulty records at the unknown boundary", () => {
    const malformedSubmission = {
      "1": [
        {
          p_title: "Broken",
          p_maxscore: 100,
          submmit_lang: "cpp20",
          submmit_at: "not-a-date",
          submmit_score: 100,
        },
      ],
    };

    expect(() =>
      buildUserDashboard("jtw7913", user, malformedSubmission, {}, problemTotals),
    ).toThrow(/submission/i);
    expect(() => buildUserDashboard("jtw7913", user, {}, { "1": 42 }, problemTotals)).toThrow(
      /difficulty/i,
    );
  });

  it("rejects a score above its contemporaneous maximum", () => {
    const invalidScore = {
      "1": [
        {
          p_title: "Broken Score",
          p_maxscore: 100,
          submmit_lang: "cpp20",
          submmit_at: "2026-01-01T00:00:00.000Z",
          submmit_score: 101,
        },
      ],
    };

    expect(() => buildUserDashboard("jtw7913", user, invalidScore, {}, problemTotals)).toThrow(
      /submission/i,
    );
  });

  it("rejects an impossible ISO submission date", () => {
    const impossibleDate = {
      "1": [
        {
          p_title: "Broken Date",
          p_maxscore: 100,
          submmit_lang: "cpp20",
          submmit_at: "2026-02-30T00:00:00.000Z",
          submmit_score: 100,
        },
      ],
    };

    expect(() => buildUserDashboard("jtw7913", user, impossibleDate, {}, problemTotals)).toThrow(
      /submission/i,
    );
  });

  it("rejects a present difficulty that is not a supported tier", () => {
    expect(() =>
      buildUserDashboard("jtw7913", user, {}, { "1": "Legendary I" }, problemTotals),
    ).toThrow(
      /difficulty/i,
    );
  });

  it("uses KST calendar dates for first-full and activity-day semantics", () => {
    const dashboard = buildUserDashboard(
      "jtw7913",
      user,
      {
        "999": [
          {
            p_title: "KST Boundary",
            p_maxscore: 100,
            submmit_lang: "cpp20",
            submmit_at: "2026-07-08T15:00:00.000Z",
            submmit_score: 100,
          },
        ],
      },
      {},
      problemTotals,
    );

    expect(dashboard.problems[0].firstFullDate).toBe("2026-07-09");
    expect(dashboard.problemSolveStreak.asOf).toBe("2026-07-09");
    expect(dashboard.problemSolveStreak.days).toEqual([{ date: "2026-07-09", count: 1 }]);
  });

  it.each([
    [
      "missing UR",
      Object.fromEntries(Object.entries(problemTotals).filter(([key]) => key !== "UR")),
      /problems\.json.*UR.*missing/i,
    ],
    ["extra X1", { ...problemTotals, X1: 1 }, /problems\.json.*X1.*unexpected/i],
    ["negative B5", { ...problemTotals, B5: -1 }, /problems\.json.*B5.*non-negative/i],
    ["non-integer S2", { ...problemTotals, S2: 18.5 }, /problems\.json.*S2.*integer/i],
    ["non-object input", [], /problems\.json.*record/i],
  ] as const)("rejects %s at the problems.json boundary", (_name, input, expectedError) => {
    expect(() => buildUserDashboard("jtw7913", user, {}, {}, input)).toThrow(expectedError);
  });
});
