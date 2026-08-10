import { quantile } from "@/domain/statistics";
import type { ParsedContestInfo } from "@/features/contest/data/parseContestInfo";
import type {
  ContestDashboardData,
  RatingDistribution,
  ScoreEstimates,
  ScoreboardEntry,
} from "@/features/contest/model/types";

type ScoreboardScalar = string | number | boolean | null;
type ScoreboardField = ScoreboardScalar | readonly ScoreboardScalar[];

interface ScoreboardInputEntry {
  readonly rank?: ScoreboardField;
  readonly nickname?: ScoreboardField;
  readonly problem_scores?: ScoreboardField;
  readonly total_score?: ScoreboardField;
  readonly performance?: ScoreboardField;
  readonly rating?: ScoreboardField;
}

type ScoreboardRowInput = ScoreboardInputEntry | ScoreboardField;

/** Untrusted JSON-like value accepted at the raw scoreboard boundary. */
export type ScoreboardInput = readonly ScoreboardRowInput[] | object | ScoreboardScalar;

const SCORE_THRESHOLDS = [25, 50, 75, 100] as const;
const PROBLEM_COUNT = 9;

/** Validates and normalizes the raw mock scoreboard rows. */
export function parseScoreboard(input: ScoreboardInput): readonly ScoreboardEntry[] {
  if (!isScoreboardRows(input)) {
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

/** Estimates median pre-contest ratings at four inclusive score thresholds. */
export function estimateProblemRatings(
  entries: readonly ScoreboardEntry[],
  problemIndex: number,
): ScoreEstimates {
  if (!Number.isInteger(problemIndex) || problemIndex < 0 || problemIndex >= PROBLEM_COUNT) {
    throw new RangeError(`Problem index must be between 0 and ${PROBLEM_COUNT - 1}.`);
  }

  let previousMaximum: number | null = null;
  const estimates = SCORE_THRESHOLDS.map((threshold) => {
    const ratings = entries
      .filter((entry) => entry.rating !== null && entry.problemScores[problemIndex] >= threshold)
      .map((entry) => entry.rating)
      .filter((rating): rating is number => rating !== null);
    const median = quantile(ratings, 0.5);

    if (median === null) {
      return null;
    }

    const roundedMedian = Math.round(median / 10) * 10;
    const monotonicEstimate = Math.max(previousMaximum ?? roundedMedian, roundedMedian);
    previousMaximum = monotonicEstimate;
    return monotonicEstimate;
  });

  return {
    score25: estimates[0],
    score50: estimates[1],
    score75: estimates[2],
    score100: estimates[3],
  };
}

/** Builds the serializable contest dashboard from parsed metadata and raw scores. */
export function buildContestDashboard(
  parsed: ParsedContestInfo,
  scoreboard: ScoreboardInput,
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

function parseScoreboardEntry(input: ScoreboardRowInput, index: number): ScoreboardEntry {
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

function isScoreboardObject(
  value: ScoreboardRowInput,
): value is ScoreboardInputEntry {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScoreboardRows(value: ScoreboardInput): value is readonly ScoreboardRowInput[] {
  return Array.isArray(value);
}

function parsePositiveInteger(value: ScoreboardField | undefined, field: string): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw invalidScoreboard(`${field} must be a positive integer string`);
  }
  return Number(value);
}

function parseNickname(value: ScoreboardField | undefined, index: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw invalidScoreboard(`row ${index + 1} nickname must be a non-empty string`);
  }
  return value;
}

function parseProblemScores(
  value: ScoreboardField | undefined,
  index: number,
): readonly number[] {
  if (!isScoreboardScalarArray(value) || value.length !== PROBLEM_COUNT) {
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

function isScoreboardScalarArray(
  value: ScoreboardField | undefined,
): value is readonly ScoreboardScalar[] {
  return Array.isArray(value);
}

function parseNumericString(value: ScoreboardField | undefined, field: string): number {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    throw invalidScoreboard(`${field} must be a non-negative numeric string`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw invalidScoreboard(`${field} must be finite`);
  }
  return parsed;
}

function parsePerformance(value: ScoreboardField | undefined, index: number): number | null {
  if (value === "-") return null;
  return parseNumericString(value, `row ${index + 1} performance`);
}

function parseRating(value: ScoreboardField | undefined, index: number): number | null {
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
