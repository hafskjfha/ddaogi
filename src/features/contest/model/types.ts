import type { ProblemTier } from "@/domain/problemTier";

/** Normalized participation timing used by a contest. */
export type ParticipationType = "regular" | "window";

/** Serializable data needed to render the complete contest dashboard. */
export interface ContestDashboardData {
  readonly contest: ContestSummary;
  readonly ratingDistribution: RatingDistribution;
  readonly problems: readonly ContestProblem[];
  readonly ratedParticipantCount: number;
}

/** Estimated pre-contest ratings for fixed score thresholds. */
export interface ScoreEstimates {
  readonly score25: number | null;
  readonly score50: number | null;
  readonly score75: number | null;
  readonly score100: number | null;
}

/** A DOJ profile reference with the rating supplied by the source. */
export interface LinkedRatedUser {
  readonly handle: string;
  readonly rating: number;
  readonly href: string;
}

/** Normalized contest identity, schedule, and administration metadata. */
export interface ContestSummary {
  readonly slug: string;
  readonly title: string;
  readonly href: string;
  readonly problemOrder: string;
  readonly ratedUpperBound: number;
  readonly director: LinkedRatedUser;
  readonly setter: LinkedRatedUser;
  readonly startAt: string;
  readonly endAt: string;
  readonly startLabel: string;
  readonly endLabel: string;
  readonly participationType: ParticipationType;
  readonly durationMinutes: number;
}

/** Five-number rating summary for participants with supplied ratings. */
export interface RatingDistribution {
  readonly min: number;
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly max: number;
  readonly count: number;
}

/** Normalized problem metadata and scoreboard-derived estimates. */
export interface ContestProblem {
  readonly index: string;
  readonly title: string;
  readonly href: string;
  readonly tier: ProblemTier;
  readonly firstFull: (LinkedRatedUser & { readonly time: string }) | null;
  readonly estimates: ScoreEstimates;
}

/** Validated and normalized scoreboard participant row. */
export interface ScoreboardEntry {
  readonly rank: number;
  readonly nickname: string;
  readonly problemScores: readonly number[];
  readonly totalScore: number;
  readonly performance: number | null;
  readonly rating: number | null;
}
