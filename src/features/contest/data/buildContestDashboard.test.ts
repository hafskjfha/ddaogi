import scoreboard from "../../../../data/contest_score_board.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildContestDashboard,
  calculateRatingDistribution,
  estimateProblemRatings,
  parseScoreboard,
} from "@/features/contest/data/buildContestDashboard";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/contest_info.md"), "utf8");

const emptyScores = ["0", "0", "0", "0", "0", "0", "0", "0", "0"] as const;

describe("contest analytics", () => {
  it("calculates rated participant quartiles from the actual scoreboard", () => {
    const entries = parseScoreboard(scoreboard);

    expect(calculateRatingDistribution(entries)).toEqual({
      min: 1200,
      q1: 1261,
      median: 1452,
      q3: 1815,
      max: 2327,
      count: 39,
    });
  });

  it("returns monotonic rounded estimates for each score threshold", () => {
    const entries = parseScoreboard(scoreboard);
    const estimates = estimateProblemRatings(entries, 7);
    const numeric = [
      estimates.score25,
      estimates.score50,
      estimates.score75,
      estimates.score100,
    ].filter((value): value is number => value !== null);

    expect(numeric.every((value) => value % 10 === 0)).toBe(true);
    expect(numeric.every((value, index) => index === 0 || value >= numeric[index - 1])).toBe(true);
  });

  it("includes exact score boundaries and preserves null thresholds during cumulative maximum", () => {
    const entries = parseScoreboard([
      {
        rank: "1",
        nickname: "below",
        problem_scores: ["24", ...emptyScores.slice(1)],
        total_score: "24",
        performance: "1000",
        rating: 1000,
      },
      {
        rank: "2",
        nickname: "quarter",
        problem_scores: ["25", ...emptyScores.slice(1)],
        total_score: "25",
        performance: "900",
        rating: 900,
      },
      {
        rank: "3",
        nickname: "half",
        problem_scores: ["50", ...emptyScores.slice(1)],
        total_score: "50",
        performance: "800",
        rating: 800,
      },
      {
        rank: "4",
        nickname: "unrated-full",
        problem_scores: ["100", ...emptyScores.slice(1)],
        total_score: "100",
        performance: "-",
      },
    ]);

    expect(estimateProblemRatings(entries, 0)).toEqual({
      score25: 850,
      score50: 850,
      score75: null,
      score100: null,
    });
  });

  it("uses supplied pre-contest ratings even when contest performance is unavailable", () => {
    const entries = parseScoreboard([
      {
        rank: "1",
        nickname: "has-rating",
        problem_scores: emptyScores,
        total_score: "0",
        performance: "-",
        rating: 1500,
      },
      {
        rank: "1",
        nickname: "missing-rating",
        problem_scores: emptyScores,
        total_score: "0",
        performance: "1600",
      },
    ]);

    expect(entries).toEqual([
      expect.objectContaining({ performance: null, rating: 1500 }),
      expect.objectContaining({ performance: 1600, rating: null }),
    ]);
    expect(calculateRatingDistribution(entries)).toEqual({
      min: 1500,
      q1: 1500,
      median: 1500,
      q3: 1500,
      max: 1500,
      count: 1,
    });
  });

  it.each([
    ["non-array root", { rows: [] }],
    [
      "non-numeric rank",
      [{ rank: "first", nickname: "broken", problem_scores: emptyScores, total_score: "0", performance: "-" }],
    ],
    [
      "blank nickname",
      [{ rank: "1", nickname: " ", problem_scores: emptyScores, total_score: "0", performance: "-" }],
    ],
    [
      "wrong score count",
      [{ rank: "1", nickname: "broken", problem_scores: ["0"], total_score: "0", performance: "-" }],
    ],
    [
      "unavailable score",
      [{ rank: "1", nickname: "broken", problem_scores: ["-", ...emptyScores.slice(1)], total_score: "0", performance: "-" }],
    ],
    [
      "inconsistent total",
      [{ rank: "1", nickname: "broken", problem_scores: emptyScores, total_score: "1", performance: "-" }],
    ],
    [
      "invalid performance",
      [{ rank: "1", nickname: "broken", problem_scores: emptyScores, total_score: "0", performance: "FF" }],
    ],
    [
      "non-numeric rating",
      [{ rank: "1", nickname: "broken", problem_scores: emptyScores, total_score: "0", performance: "-", rating: "1500" }],
    ],
  ])("rejects a scoreboard with %s", (_case, invalidScoreboard) => {
    expect(() => parseScoreboard(invalidScoreboard)).toThrow(/scoreboard/i);
  });

  it("accepts an untrusted raw boundary and rejects nested malformed JSON", () => {
    const malformedScoreboards: readonly unknown[] = [
      [["not", "a", "participant", "object"]],
      [
        {
          rank: "1",
          nickname: "nested-score",
          problem_scores: [{ points: "100" }, ...emptyScores.slice(1)],
          total_score: "100",
          performance: "1500",
          rating: 1500,
        },
      ],
    ];

    for (const malformedScoreboard of malformedScoreboards) {
      expect(() => parseScoreboard(malformedScoreboard)).toThrow(/scoreboard/i);
    }
  });

  it("rejects analytics requests without ratings or outside the nine score columns", () => {
    const unratedEntries = parseScoreboard([
      {
        rank: "1",
        nickname: "unrated",
        problem_scores: emptyScores,
        total_score: "0",
        performance: "-",
      },
    ]);

    expect(() => calculateRatingDistribution(unratedEntries)).toThrow(/rating/i);
    expect(() => estimateProblemRatings(unratedEntries, -1)).toThrow(RangeError);
    expect(() => estimateProblemRatings(unratedEntries, 9)).toThrow(RangeError);
  });

  it("builds all contest problems with estimates from the supplied files", () => {
    const dashboard = buildContestDashboard(parseContestInfo(markdown), scoreboard);

    expect(dashboard.ratedParticipantCount).toBe(39);
    expect(dashboard.problems).toHaveLength(9);
    expect(dashboard.problems[0]).toMatchObject({
      index: "A",
      title: "두 수열",
      estimates: { score25: 1450, score50: 1450, score75: 1450, score100: 1450 },
    });
    expect(dashboard.problems[8]).toMatchObject({
      index: "I",
      firstFull: null,
      estimates: { score25: 2120, score50: 2190, score75: null, score100: null },
    });
  });
});
