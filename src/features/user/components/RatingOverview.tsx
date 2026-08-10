"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ContestHistoryTable } from "@/features/user/components/ContestHistoryTable";
import { ContestStreak } from "@/features/user/components/ContestStreak";
import { RatingHistoryChart } from "@/features/user/components/RatingHistoryChart";
import type { UserDashboardData } from "@/features/user/model/types";

/** Presents rating history, contest records, and contest-index streaks. */
export function RatingOverview({ dashboard }: { dashboard: UserDashboardData }) {
  const [series, setSeries] = useState<"rating" | "performance">("rating");

  return (
    <div className="space-y-6">
      <div role="group" className="flex gap-2" aria-label="차트 지표">
        <Button
          aria-pressed={series === "rating"}
          variant={series === "rating" ? "default" : "outline"}
          onClick={() => setSeries("rating")}
        >
          레이팅 보기
        </Button>
        <Button
          aria-pressed={series === "performance"}
          variant={series === "performance" ? "default" : "outline"}
          onClick={() => setSeries("performance")}
        >
          퍼포먼스 보기
        </Button>
      </div>
      <RatingHistoryChart
        initialRating={dashboard.initialRating}
        history={dashboard.ratingHistory}
        series={series}
      />
      <ContestHistoryTable history={dashboard.ratingHistory} />
      <ContestStreak data={dashboard.contestStreak} />
    </div>
  );
}
