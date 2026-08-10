import { parseProblemTier, type ProblemTier, type ProblemTierGroup } from "@/domain/problemTier";
import { getRatingBand } from "@/domain/rating";
import { calculateDailyStreak, calculateSequenceStreak } from "@/domain/streak";
import type { ParsedUserInfo } from "@/features/user/data/parseUserInfo";
import type {
  ContestParticipation,
  DailyActivityData,
  DistributionItem,
  ProblemSummary,
  Submission,
  UserDashboardData,
} from "@/features/user/model/types";

interface RawSubmission {
  readonly p_title: string;
  readonly p_maxscore: number;
  readonly submmit_lang: string;
  readonly submmit_at: string;
  readonly submmit_score: number;
}

const TIER_GROUP_ORDER: readonly ProblemTierGroup[] = [
  "Unrated",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Ruby",
];

const GROUP_SHORT_LABELS: Record<ProblemTierGroup, string> = {
  Unrated: "U",
  Bronze: "B",
  Silver: "S",
  Gold: "G",
  Platinum: "P",
  Diamond: "D",
  Ruby: "R",
};

const LANGUAGE_LABELS: Readonly<Record<string, string>> = {
  cpp17: "C++17",
  cpp20: "C++20",
  "custom-json": "Custom JSON",
  pypy3: "PyPy 3",
  python3: "Python 3",
};

const LANGUAGE_COLORS: Readonly<Record<string, string>> = {
  cpp17: "#3b82f6",
  cpp20: "#2563eb",
  "custom-json": "#f59e0b",
  pypy3: "#8b5cf6",
  python3: "#22c55e",
};

const FALLBACK_LANGUAGE_COLORS = ["#06b6d4", "#ec4899", "#84cc16", "#f97316"] as const;

/** Validates mock JSON inputs and derives the serializable user-dashboard DTO. */
export function buildUserDashboard(
  handle: string,
  user: ParsedUserInfo,
  resultsInput: unknown,
  difficultiesInput: unknown,
): UserDashboardData {
  const rawResults = parseResultsInput(resultsInput);
  const difficulties = parseDifficultiesInput(difficultiesInput);
  const problems = buildProblems(rawResults, difficulties);
  const ratingHistory = buildRatingHistory(user);
  const titleBand = getRatingBand(user.profile.currentRating);
  const solvedProblems = problems.filter((problem) => problem.solved);

  return {
    profile: {
      handle,
      ...user.profile,
      title: titleBand.title,
      titleColor: titleBand.color,
      solvedCount: solvedProblems.length,
      solvedRank: null,
      firstPlaceCount: null,
    },
    initialRating: user.initialRating,
    ratingHistory,
    contestStreak: {
      ...calculateSequenceStreak(user.contestCalendar.map((entry) => entry.participated)),
      entries: user.contestCalendar,
    },
    problems,
    problemSolveStreak: buildProblemSolveStreak(problems, user),
    difficultyGroups: buildDifficultyGroupDistribution(solvedProblems),
    difficultyDetails: buildDifficultyDetailDistribution(solvedProblems),
    languages: buildLanguageDistribution(problems),
    totalSubmissions: problems.reduce((total, problem) => total + problem.submissions.length, 0),
  };
}

function parseResultsInput(input: unknown): ReadonlyMap<string, readonly RawSubmission[]> {
  if (!isRecord(input)) {
    throw new TypeError("Invalid results input: expected a problem record");
  }

  const parsed = new Map<string, readonly RawSubmission[]>();

  for (const [problemId, submissionsInput] of Object.entries(input)) {
    if (!Array.isArray(submissionsInput) || submissionsInput.length === 0) {
      throw new TypeError(`Invalid results input: problem "${problemId}" must contain submissions`);
    }

    if (!submissionsInput.every(isRawSubmission)) {
      throw new TypeError(`Invalid submission in results input for problem "${problemId}"`);
    }

    const first = submissionsInput[0];
    if (submissionsInput.some((submission) => submission.p_title !== first.p_title)) {
      throw new TypeError(`Invalid submission metadata in results input for problem "${problemId}"`);
    }

    parsed.set(problemId, submissionsInput);
  }

  return parsed;
}

function parseDifficultiesInput(input: unknown): ReadonlyMap<string, string> {
  if (!isRecord(input)) {
    throw new TypeError("Invalid difficulty input: expected a problem record");
  }

  const parsed = new Map<string, string>();

  for (const [problemId, difficulty] of Object.entries(input)) {
    if (typeof difficulty !== "string") {
      throw new TypeError(`Invalid difficulty for problem "${problemId}"`);
    }

    const normalizedTier = parseProblemTier(difficulty);
    if (normalizedTier.label !== difficulty.trim()) {
      throw new TypeError(`Invalid difficulty for problem "${problemId}"`);
    }

    parsed.set(problemId, normalizedTier.label);
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRawSubmission(value: unknown): value is RawSubmission {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.p_title === "string" &&
    value.p_title.length > 0 &&
    typeof value.p_maxscore === "number" &&
    Number.isFinite(value.p_maxscore) &&
    value.p_maxscore > 0 &&
    typeof value.submmit_lang === "string" &&
    value.submmit_lang.length > 0 &&
    typeof value.submmit_at === "string" &&
    isValidUtcTimestamp(value.submmit_at) &&
    typeof value.submmit_score === "number" &&
    Number.isFinite(value.submmit_score) &&
    value.submmit_score >= 0 &&
    value.submmit_score <= value.p_maxscore
  );
}

function isValidUtcTimestamp(value: string): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?Z$/.exec(value);

  if (!match) {
    return false;
  }

  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[3]) &&
    date.getUTCHours() === Number(match[4]) &&
    date.getUTCMinutes() === Number(match[5]) &&
    date.getUTCSeconds() === Number(match[6])
  );
}

function buildProblems(
  rawResults: ReadonlyMap<string, readonly RawSubmission[]>,
  difficulties: ReadonlyMap<string, string>,
): readonly ProblemSummary[] {
  return [...rawResults.entries()]
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId, undefined, { numeric: true }))
    .map(([id, rawSubmissions]) => {
      const submissions = rawSubmissions
        .map(normalizeSubmission)
        .sort((left, right) => left.submittedAt.localeCompare(right.submittedAt));
      const maxScore = Math.max(...rawSubmissions.map((submission) => submission.p_maxscore));
      const bestScore = Math.max(...submissions.map((submission) => submission.score));
      const firstFullSubmission = submissions.find(
        (submission) => submission.score === submission.maxScore,
      );

      return {
        id,
        title: rawSubmissions[0].p_title,
        tier: parseProblemTier(difficulties.get(id)),
        bestScore,
        maxScore,
        solved: firstFullSubmission !== undefined,
        firstFullDate: firstFullSubmission?.submittedAt.slice(0, 10) ?? null,
        submissions,
      };
    });
}

function normalizeSubmission(raw: RawSubmission): Submission {
  return {
    language: raw.submmit_lang,
    submittedAt: raw.submmit_at,
    score: raw.submmit_score,
    maxScore: raw.p_maxscore,
  };
}

function buildRatingHistory(user: ParsedUserInfo): readonly ContestParticipation[] {
  let rating = user.initialRating;

  return user.participations.map((participation) => {
    const tierBefore = getRatingBand(rating).title;

    if (participation.ratingDiff !== null) {
      rating += participation.ratingDiff;
    }

    return {
      ...participation,
      ratingAfter: rating,
      tierBefore,
      tierAfter: getRatingBand(rating).title,
    };
  });
}

function buildProblemSolveStreak(
  problems: readonly ProblemSummary[],
  user: ParsedUserInfo,
): DailyActivityData {
  const submissionDates = problems.flatMap((problem) =>
    problem.submissions.map((submission) => submission.submittedAt.slice(0, 10)),
  );
  const firstFullDates = problems
    .map((problem) => problem.firstFullDate)
    .filter((date): date is string => date !== null);
  const asOf = submissionDates.sort().at(-1) ?? user.contestCalendar.at(-1)?.date ?? "1970-01-01";
  const firstDay = [...submissionDates, ...firstFullDates].sort()[0] ?? asOf;
  const solveCounts = countBy(firstFullDates);
  const days = enumerateIsoDates(firstDay, asOf).map((date) => ({
    date,
    count: solveCounts.get(date) ?? 0,
  }));

  return {
    asOf,
    days,
    ...calculateDailyStreak(firstFullDates, asOf),
  };
}

function buildDifficultyGroupDistribution(
  solvedProblems: readonly ProblemSummary[],
): readonly DistributionItem[] {
  const solvedCounts = countBy(solvedProblems.map((problem) => problem.tier.group));

  return TIER_GROUP_ORDER.map((group) => {
    const tier = parseProblemTier(group === "Unrated" ? undefined : `${group} V`);
    const count = solvedCounts.get(group) ?? 0;

    return {
      key: group,
      label: group,
      shortLabel: GROUP_SHORT_LABELS[group],
      count,
      percentage: percentage(count, solvedProblems.length),
      color: tier.color,
      totalAvailable: null,
    };
  });
}

function buildDifficultyDetailDistribution(
  solvedProblems: readonly ProblemSummary[],
): readonly DistributionItem[] {
  const tierOrder = buildTierOrder();
  const solvedCounts = countBy(solvedProblems.map((problem) => problem.tier.label));

  return tierOrder.map((tier) => {
    const count = solvedCounts.get(tier.label) ?? 0;

    return {
      key: tier.label,
      label: tier.label,
      shortLabel: tier.shortLabel,
      count,
      percentage: percentage(count, solvedProblems.length),
      color: tier.color,
      totalAvailable: null,
    };
  });
}

function buildTierOrder(): readonly ProblemTier[] {
  const levels = ["V", "IV", "III", "II", "I"] as const;

  return [
    parseProblemTier(),
    ...TIER_GROUP_ORDER.filter((group) => group !== "Unrated").flatMap((group) =>
      levels.map((level) => parseProblemTier(`${group} ${level}`)),
    ),
  ];
}

function buildLanguageDistribution(problems: readonly ProblemSummary[]): readonly DistributionItem[] {
  const submissions = problems.flatMap((problem) => problem.submissions);
  const counts = countBy(submissions.map((submission) => submission.language));

  return [...counts.entries()]
    .sort(([leftKey, leftCount], [rightKey, rightCount]) => {
      return rightCount - leftCount || leftKey.localeCompare(rightKey);
    })
    .map(([language, count], index) => {
      const label = LANGUAGE_LABELS[language] ?? language;

      return {
        key: language,
        label,
        shortLabel: label,
        count,
        percentage: percentage(count, submissions.length),
        color:
          LANGUAGE_COLORS[language] ??
          FALLBACK_LANGUAGE_COLORS[index % FALLBACK_LANGUAGE_COLORS.length],
        totalAvailable: null,
      };
    });
}

function countBy(values: readonly string[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : (count / total) * 100;
}

function enumerateIsoDates(start: string, end: string): readonly string[] {
  const current = new Date(`${start}T00:00:00.000Z`);
  const last = new Date(`${end}T00:00:00.000Z`);
  const dates: string[] = [];

  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}
