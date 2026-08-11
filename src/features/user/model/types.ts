import type { ProblemTier } from "@/domain/problemTier";
import type { RatingTitle } from "@/domain/rating";
import type { StreakSummary } from "@/domain/streak";

export interface UserDashboardData {
  readonly profile: UserProfile;
  readonly initialRating: number;
  readonly ratingHistory: readonly ContestParticipation[];
  readonly contestStreak: ContestStreakData;
  readonly problems: readonly ProblemSummary[];
  readonly problemSolveStreak: DailyActivityData;
  readonly difficultyGroups: readonly DistributionItem[];
  readonly difficultyDetails: readonly DistributionItem[];
  readonly languages: readonly DistributionItem[];
  readonly totalSubmissions: number;
}

export interface UserProfile {
  readonly handle: string;
  readonly currentRating: number;
  readonly maxRating: number;
  readonly ratingRank: number;
  readonly ratingPercentile: number;
  readonly title: RatingTitle;
  readonly titleColor: string;
  readonly solvedCount: number;
  readonly solvedRank: number | null;
  /** Count of top-three finishes reported by the source. */
  readonly podiumCount: number;
  /** Exact first-place count, or null when unavailable in another data source. */
  readonly firstPlaceCount: number | null;
  readonly firstFullCount: number;
}

export interface ContestParticipation {
  readonly date: string;
  readonly name: string;
  readonly rank: number;
  readonly performanceRating: number | null;
  readonly ratingDiff: number | null;
  readonly ratingAfter: number;
  readonly rated: boolean;
  readonly tierBefore: RatingTitle;
  readonly tierAfter: RatingTitle;
}

export interface ContestCalendarEntry {
  readonly index: number;
  readonly date: string;
  readonly name: string;
  readonly participated: boolean;
}

export interface ContestStreakData extends StreakSummary {
  readonly entries: readonly ContestCalendarEntry[];
}

export interface Submission {
  readonly language: string;
  readonly submittedAt: string;
  readonly score: number;
  readonly maxScore: number;
}

export interface ProblemSummary {
  readonly id: string;
  readonly title: string;
  readonly tier: ProblemTier;
  readonly bestScore: number;
  readonly maxScore: number;
  readonly solved: boolean;
  readonly firstFullDate: string | null;
  readonly submissions: readonly Submission[];
}

export interface DailyActivityPoint {
  readonly date: string;
  readonly count: number;
}

export interface DailyActivityData extends StreakSummary {
  readonly asOf: string;
  readonly days: readonly DailyActivityPoint[];
}

export interface DistributionItem {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly count: number;
  readonly percentage: number;
  readonly color: string;
  readonly totalAvailable: number | null;
}
