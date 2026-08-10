import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestHero } from "@/features/contest/components/ContestHero";
import { ContestProblemAnalysis } from "@/features/contest/components/ContestProblemAnalysis";
import { RatingQuartiles } from "@/features/contest/components/RatingQuartiles";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("contest dashboard composition", () => {
  it("renders every required contest analytics section", () => {
    render(
      <>
        <ContestHero contest={contestDashboardFixture.contest} />
        <RatingQuartiles distribution={contestDashboardFixture.ratingDistribution} />
        <ContestProblemAnalysis problems={contestDashboardFixture.problems} />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "DOJ Beginner Contest 4" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rated 참가자 분포" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "문제 분석" })).toBeInTheDocument();
  });
});
