"use client";

import { DifficultyDistribution } from "@/features/user/components/DifficultyDistribution";
import { ProblemList } from "@/features/user/components/ProblemList";
import { ProblemSolveStreak } from "@/features/user/components/ProblemSolveStreak";
import type { UserDashboardData } from "@/features/user/model/types";

/** Presents solved problems, partial attempts, solve streaks, and tier distributions. */
export function ProblemOverview({ dashboard }: { dashboard: UserDashboardData }) {
  const solved = dashboard.problems.filter((problem) => problem.solved);
  const partial = dashboard.problems.filter((problem) => !problem.solved);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ProblemList
          title="만점 문제"
          listLabel="만점 문제 목록"
          problems={solved}
          showScore={false}
        />
        <ProblemList
          title="만점 미달"
          listLabel="만점 미달 목록"
          problems={partial}
          showScore
        />
      </div>
      <ProblemSolveStreak data={dashboard.problemSolveStreak} />
      <DifficultyDistribution groups={dashboard.difficultyGroups} details={dashboard.difficultyDetails} />
    </div>
  );
}
