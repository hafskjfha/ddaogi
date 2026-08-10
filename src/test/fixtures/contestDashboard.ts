import { parseProblemTier } from "@/domain/problemTier";
import type { ContestDashboardData } from "@/features/contest/model/types";

/** Representative normalized contest data for rendering tests. */
export const contestDashboardFixture: ContestDashboardData = {
  contest: {
    slug: "doj-beginner-contest-4",
    title: "DOJ Beginner Contest 4",
    problemOrder: "난이도순",
    ratedUpperBound: 2400,
    director: "admin",
    setter: "lunarlity",
    startAt: "2026-07-08T21:00:00+09:00",
    endAt: "2026-07-08T22:40:00+09:00",
    startLabel: "2026년 7월 8일 오후 9:00",
    endLabel: "2026년 7월 8일 오후 10:40",
    participationType: "regular",
    durationMinutes: 100,
  },
  ratingDistribution: {
    min: 1200,
    q1: 1261,
    median: 1452,
    q3: 1815,
    max: 2327,
    count: 39,
  },
  problems: [
    {
      index: "A",
      title: "두 수열",
      tier: parseProblemTier("Bronze I"),
      firstFullHandle: "jkrt",
      firstFullTime: "0m 55s",
      estimates: { score25: 1400, score50: 1400, score75: 1410, score100: 1430 },
    },
    {
      index: "I",
      title: "직사각형 2",
      tier: parseProblemTier("Diamond II"),
      firstFullHandle: null,
      firstFullTime: null,
      estimates: { score25: 2100, score50: 2200, score75: null, score100: null },
    },
  ],
  ratedParticipantCount: 39,
};
