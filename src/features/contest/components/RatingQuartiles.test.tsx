import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RatingQuartiles } from "@/features/contest/components/RatingQuartiles";
import type { RatingDistribution } from "@/features/contest/model/types";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("RatingQuartiles", () => {
  it("presents the five-number summary as visible semantic content", () => {
    render(<RatingQuartiles distribution={contestDashboardFixture.ratingDistribution} />);

    expect(screen.getByRole("heading", { name: "Rated 참가자 분포" })).toBeInTheDocument();
    expect(screen.getByText("39명")).toBeInTheDocument();
    const summary = screen.getByRole("list", { name: "Rated 참가자 레이팅 5수 요약" });
    const items = within(summary).getAllByRole("listitem");

    expect(items).toHaveLength(5);
    expect(within(items[0]).getByText("최솟값 1,200")).toBeInTheDocument();
    expect(within(items[1]).getByText("Q1 1,261")).toBeInTheDocument();
    expect(within(items[2]).getByText("중앙값 1,452")).toBeInTheDocument();
    expect(within(items[3]).getByText("Q3 1,815")).toBeInTheDocument();
    expect(within(items[4]).getByText("최댓값 2,327")).toBeInTheDocument();
  });

  it("positions markers on the rating range and uses rating colors as contrast-safe borders", () => {
    render(<RatingQuartiles distribution={contestDashboardFixture.ratingDistribution} />);

    expectMarker("min", 0, "rgb(34, 197, 94)");
    expectMarker("q1", 5.4126, "rgb(34, 197, 94)");
    expectMarker("median", 22.3602, "rgb(20, 184, 166)");
    expectMarker("q3", 54.5697, "rgb(139, 92, 246)");
    expectMarker("max", 100, "rgb(239, 68, 68)");

    const medianLabel = screen.getByText("중앙값 1,452");
    expect(medianLabel).toHaveStyle({ borderColor: "rgb(20, 184, 166)" });
    expect(medianLabel).not.toHaveStyle({ color: "rgb(20, 184, 166)" });
    expect(medianLabel).toHaveClass("text-slate-950", "dark:text-slate-50");
  });

  it("keeps a zero-width distribution finite and clamped", () => {
    const tiedDistribution: RatingDistribution = {
      min: 1400,
      q1: 1400,
      median: 1400,
      q3: 1400,
      max: 1400,
      count: 4,
    };

    render(<RatingQuartiles distribution={tiedDistribution} />);

    for (const marker of screen.getAllByTestId(/^rating-marker-/)) {
      expect(marker).toHaveStyle({ left: "0%" });
    }
    expect(screen.getAllByText(/1,400/)).toHaveLength(5);
  });
});

function expectMarker(key: string, expectedPosition: number, expectedColor: string): void {
  const marker = screen.getByTestId(`rating-marker-${key}`);

  expect(Number.parseFloat(marker.style.left)).toBeCloseTo(expectedPosition, 4);
  expect(marker).toHaveStyle({ borderColor: expectedColor });
}
