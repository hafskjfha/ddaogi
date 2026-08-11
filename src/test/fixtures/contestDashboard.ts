import { parseProblemTier } from "@/domain/problemTier";
import type { ContestDashboardData } from "@/features/contest/model/types";

/** Representative normalized contest data for rendering tests. */
export const contestDashboardFixture: ContestDashboardData = {
  contest: {
    slug: "doj-beginner-contest-4",
    title: "DOJ Beginner Contest 4",
    href: "https://doj.kr/ko/contests/doj-beginner-contest-4",
    problemOrder: "난이도순",
    ratedUpperBound: 2400,
    director: {
      handle: "admin",
      rating: 1352,
      href: "https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h",
    },
    setter: {
      handle: "lunarlity",
      rating: 1280,
      href: "https://doj.kr/ko/user/cmoh8o181003i89jvd67yd4ca",
    },
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
      href: "https://doj.kr/ko/problems/342",
      tier: parseProblemTier("Bronze I"),
      firstFull: {
        handle: "jkrt",
        rating: 2369,
        href: "https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh",
        time: "0m 55s",
      },
      estimates: { score25: 1400, score50: 1400, score75: 1410, score100: 1430 },
    },
    {
      index: "I",
      title: "직사각형 2",
      href: "https://doj.kr/ko/problems/350",
      tier: parseProblemTier("Diamond II"),
      firstFull: null,
      estimates: { score25: 2100, score50: 2200, score75: null, score100: null },
    },
  ],
  ratedParticipantCount: 39,
};
