import { quantile } from "@/domain/statistics";
import type { ParsedContestInfo } from "@/features/contest/data/parseContestInfo";
import type {
  ContestDashboardData,
  RatingDistribution,
  ScoreEstimates,
  ScoreboardEntry,
} from "@/features/contest/model/types";

const PARTIAL_SCORE_QUANTILES = [0.25, 0.5, 0.75] as const;
const PROBLEM_COUNT = 9;

/** Validates and normalizes the raw mock scoreboard rows. */
export function parseScoreboard(input: unknown): readonly ScoreboardEntry[] {
  if (!isUnknownArray(input)) {
    throw invalidScoreboard("expected an array of participant rows");
  }

  return input.map((row, index) => parseScoreboardEntry(row, index));
}

/** Calculates interpolated rating quartiles for entries with supplied ratings. */
export function calculateRatingDistribution(
  entries: readonly ScoreboardEntry[],
): RatingDistribution {
  const ratings = entries
    .map((entry) => entry.rating)
    .filter((rating): rating is number => rating !== null)
    .sort((left, right) => left - right);

  if (ratings.length === 0) {
    throw new Error("Cannot calculate rating distribution without participant ratings.");
  }

  return {
    min: roundedQuantile(ratings, 0),
    q1: roundedQuantile(ratings, 0.25),
    median: roundedQuantile(ratings, 0.5),
    q3: roundedQuantile(ratings, 0.75),
    max: roundedQuantile(ratings, 1),
    count: ratings.length,
  };
}

/** Selects representative observed partial scores and always includes full score. */
export function selectScoreThresholds(
  entries: readonly ScoreboardEntry[],
  problemIndex: number,
): readonly number[] {
  assertProblemIndex(problemIndex);

  const partialScores = entries
    .map((entry) => entry.problemScores[problemIndex])
    .filter((score) => score > 0 && score < 100)
    .sort((left, right) => left - right);
  const selected = PARTIAL_SCORE_QUANTILES.map((percentile) => {
    const index = Math.ceil(percentile * partialScores.length) - 1;
    return partialScores[index];
  }).filter((score): score is number => score !== undefined);

  return [...new Set([...selected, 100])].sort((left, right) => left - right);
}

/** Fits a kenkoooo-style success-probability difficulty at each selected score. */
export function estimateProblemRatings(
  entries: readonly ScoreboardEntry[],
  problemIndex: number,
): ScoreEstimates {
  assertProblemIndex(problemIndex);

  return selectScoreThresholds(entries, problemIndex).map((score) => ({
    score,
    rating: estimateRatingAtScore(entries, problemIndex, score),
  }));
}

/** Builds the serializable contest dashboard from parsed metadata and raw scores. */
export function buildContestDashboard(
  parsed: ParsedContestInfo,
  scoreboard: unknown,
): ContestDashboardData {
  const entries = parseScoreboard(scoreboard);
  const ratingDistribution = calculateRatingDistribution(entries);

  return {
    contest: parsed.contest,
    ratingDistribution,
    problems: parsed.problems.map((problem, problemIndex) => ({
      ...problem,
      estimates: estimateProblemRatings(entries, problemIndex),
    })),
    ratedParticipantCount: ratingDistribution.count,
  };
}

function parseScoreboardEntry(input: unknown, index: number): ScoreboardEntry {
  if (!isScoreboardObject(input)) {
    throw invalidScoreboard(`row ${index + 1} must be an object`);
  }

  const rank = parsePositiveInteger(input.rank, `row ${index + 1} rank`);
  const nickname = parseNickname(input.nickname, index);
  const problemScores = parseProblemScores(input.problem_scores, index);
  const totalScore = parseNumericString(input.total_score, `row ${index + 1} total_score`);
  const calculatedTotal = problemScores.reduce((sum, score) => sum + score, 0);

  if (totalScore !== calculatedTotal) {
    throw invalidScoreboard(
      `row ${index + 1} total_score ${totalScore} does not match problem score sum ${calculatedTotal}`,
    );
  }

  return {
    rank,
    nickname,
    problemScores,
    totalScore,
    performance: parsePerformance(input.performance, index),
    rating: parseRating(input.rating, index),
  };
}

function assertProblemIndex(problemIndex: number): void {
  if (!Number.isInteger(problemIndex) || problemIndex < 0 || problemIndex >= PROBLEM_COUNT) {
    throw new RangeError(`Problem index must be between 0 and ${PROBLEM_COUNT - 1}.`);
  }
}

function estimateRatingAtScore(
  entries: readonly ScoreboardEntry[],
  problemIndex: number,
  score: number,
): number | null {
  const ratedEntries = entries.filter(
    (entry): entry is ScoreboardEntry & { readonly rating: number } => entry.rating !== null,
  );
  const actualSuccesses = ratedEntries.filter(
    (entry) => entry.problemScores[problemIndex] >= score,
  ).length;

  if (actualSuccesses === 0 || actualSuccesses === ratedEntries.length) {
    return null;
  }

  let lower = -10_000;
  let upper = 10_000;

  while (upper - lower > 1) {
    const midpoint = Math.floor((lower + upper) / 2);
    const expectedSuccesses = ratedEntries.reduce(
      (sum, entry) => sum + 1 / (1 + 6 ** ((midpoint - entry.rating) / 400)),
      0,
    );

    if (expectedSuccesses < actualSuccesses) {
      upper = midpoint;
    } else {
      lower = midpoint;
    }
  }

  return lower;
}

function isScoreboardObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function parsePositiveInteger(value: unknown, field: string): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw invalidScoreboard(`${field} must be a positive integer string`);
  }
  return Number(value);
}

function parseNickname(value: unknown, index: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw invalidScoreboard(`row ${index + 1} nickname must be a non-empty string`);
  }
  return value;
}

function parseProblemScores(
  value: unknown,
  index: number,
): readonly number[] {
  if (!isUnknownArray(value) || value.length !== PROBLEM_COUNT) {
    throw invalidScoreboard(`row ${index + 1} problem_scores must contain nine values`);
  }

  return value.map((score, problemIndex) => {
    const parsed = parseNumericString(
      score,
      `row ${index + 1} problem_scores[${problemIndex}]`,
    );
    if (parsed < 0 || parsed > 100) {
      throw invalidScoreboard(
        `row ${index + 1} problem_scores[${problemIndex}] must be between 0 and 100`,
      );
    }
    return parsed;
  });
}

function parseNumericString(value: unknown, field: string): number {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    throw invalidScoreboard(`${field} must be a non-negative numeric string`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw invalidScoreboard(`${field} must be finite`);
  }
  return parsed;
}

function parsePerformance(value: unknown, index: number): number | null {
  if (value === "-") return null;
  return parseNumericString(value, `row ${index + 1} performance`);
}

function parseRating(value: unknown, index: number): number | null {
  if (value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw invalidScoreboard(`row ${index + 1} rating must be a non-negative finite number`);
  }
  return value;
}

function roundedQuantile(values: readonly number[], percentile: number): number {
  const result = quantile(values, percentile);
  if (result === null) {
    throw new Error("Cannot calculate a quantile from an empty rating collection.");
  }
  return Math.round(result);
}

function invalidScoreboard(message: string): TypeError {
  return new TypeError(`Invalid contest scoreboard: ${message}`);
}
