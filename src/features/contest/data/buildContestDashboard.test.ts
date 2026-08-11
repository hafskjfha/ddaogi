import scoreboard from "../../../../data/contest_score_board.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildContestDashboard,
  calculateRatingDistribution,
  estimateProblemRatings,
  parseScoreboard,
  selectScoreThresholds,
} from "@/features/contest/data/buildContestDashboard";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/contest_info.md"), "utf8");

const emptyScores = ["0", "0", "0", "0", "0", "0", "0", "0", "0"] as const;

function firstProblemScoreRow(score: number, rating: number | null, index: number) {
  return {
    rank: String(index + 1),
    nickname: `participant-${index + 1}`,
    problem_scores: [String(score), ...emptyScores.slice(1)],
    total_score: String(score),
    performance: "-",
    ...(rating === null ? {} : { rating }),
  };
}

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

  it("selects observed partial-score quartiles and always includes 100", () => {
    const entries = parseScoreboard(scoreboard);

    expect(selectScoreThresholds(entries, 8)).toEqual([22, 38, 56, 100]);
    expect(
      selectScoreThresholds(
        parseScoreboard(
          [10, 20, 30, 40, 50, 0, 100].map((score, index) =>
            firstProblemScoreRow(score, 1200 + index * 100, index),
          ),
        ),
        0,
      ),
    ).toEqual([20, 30, 40, 100]);
    expect(
      selectScoreThresholds(
        parseScoreboard(
          [100, 100].map((score, index) => firstProblemScoreRow(score, 1200, index)),
        ),
        0,
      ),
    ).toEqual([100]);
    expect(
      selectScoreThresholds(
        parseScoreboard(
          [34, 34, 34].map((score, index) => firstProblemScoreRow(score, 1200, index)),
        ),
        0,
      ),
    ).toEqual([34, 100]);
  });

  it("fits the success and failure ratings instead of taking the achiever median", () => {
    const entries = parseScoreboard([
      firstProblemScoreRow(0, 1000, 0),
      firstProblemScoreRow(100, 2000, 1),
    ]);

    expect(estimateProblemRatings(entries, 0)).toEqual([{ score: 100, rating: 1500 }]);
  });

  it("returns an unavailable estimate when every rated participant is on one side", () => {
    const noSuccess = parseScoreboard([
      firstProblemScoreRow(0, 1000, 0),
      firstProblemScoreRow(0, 2000, 1),
    ]);
    const allSuccess = parseScoreboard([
      firstProblemScoreRow(100, 1000, 0),
      firstProblemScoreRow(100, 2000, 1),
    ]);

    expect(estimateProblemRatings(noSuccess, 0)).toEqual([{ score: 100, rating: null }]);
    expect(estimateProblemRatings(allSuccess, 0)).toEqual([{ score: 100, rating: null }]);
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
    expect(estimateProblemRatings(unratedEntries, 0)).toEqual([{ score: 100, rating: null }]);
    expect(() => estimateProblemRatings(unratedEntries, -1)).toThrow(RangeError);
    expect(() => estimateProblemRatings(unratedEntries, 9)).toThrow(RangeError);
    expect(() => selectScoreThresholds(unratedEntries, -1)).toThrow(RangeError);
    expect(() => selectScoreThresholds(unratedEntries, 9)).toThrow(RangeError);
  });

  it("builds all contest problems with estimates from the supplied files", () => {
    const dashboard = buildContestDashboard(parseContestInfo(markdown), scoreboard);

    expect(dashboard.ratedParticipantCount).toBe(39);
    expect(dashboard.problems).toHaveLength(9);
    expect(dashboard.problems[0]).toMatchObject({
      index: "A",
      title: "두 수열",
      estimates: [{ score: 100, rating: 987 }],
    });
    expect(dashboard.problems[8]).toMatchObject({
      index: "I",
      firstFull: null,
      estimates: [
        { score: 22, rating: 1903 },
        { score: 38, rating: 1954 },
        { score: 56, rating: 2274 },
        { score: 100, rating: null },
      ],
    });
  });
});
