import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreOverview } from "@/features/user/components/MoreOverview";
import type { DistributionItem, UserDashboardData } from "@/features/user/model/types";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

const languageItems: readonly DistributionItem[] = [
  {
    key: "custom-json",
    label: "custom-json",
    shortLabel: "custom-json",
    count: 1,
    percentage: 6.7,
    color: "#f59e0b",
    totalAvailable: null,
  },
  {
    key: "cpp17",
    label: "cpp17",
    shortLabel: "cpp17",
    count: 2,
    percentage: 13.3,
    color: "#3b82f6",
    totalAvailable: null,
  },
  {
    key: "python3",
    label: "python3",
    shortLabel: "python3",
    count: 3,
    percentage: 20,
    color: "#22c55e",
    totalAvailable: null,
  },
  {
    key: "cpp20",
    label: "cpp20",
    shortLabel: "cpp20",
    count: 4,
    percentage: 26.7,
    color: "#2563eb",
    totalAvailable: null,
  },
  {
    key: "pypy3",
    label: "pypy3",
    shortLabel: "pypy3",
    count: 5,
    percentage: 33.3,
    color: "#8b5cf6",
    totalAvailable: null,
  },
];

describe("MoreOverview", () => {
  it("renders an explicit zero first-place count instead of unavailable copy", () => {
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      profile: {
        ...userDashboardFixture.profile,
        podiumCount: 3,
        firstPlaceCount: 0,
      },
    };

    render(<MoreOverview dashboard={dashboard} />);

    const firstPlaceCard = screen
      .getByText("대회 1등")
      .closest<HTMLElement>('[role="listitem"]');
    if (!firstPlaceCard) throw new Error("First-place metric card is missing");

    expect(within(firstPlaceCard).getByText("0회")).toBeInTheDocument();
    expect(within(firstPlaceCard).queryByText("3회")).not.toBeInTheDocument();
    expect(within(firstPlaceCard).queryByText("집계 미제공")).not.toBeInTheDocument();
  });

  it("renders language labels, totals, wins, and first full scores", () => {
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      profile: {
        ...userDashboardFixture.profile,
        podiumCount: 3,
        firstPlaceCount: 5,
        firstFullCount: 7,
      },
      languages: languageItems,
      totalSubmissions: 1234,
    };

    render(<MoreOverview dashboard={dashboard} />);

    expect(screen.getByText("PyPy 3")).toBeInTheDocument();
    expect(screen.getByText("C++20")).toBeInTheDocument();
    expect(screen.getByText("전체 제출")).toBeInTheDocument();
    expect(screen.getByText("사용 언어")).toBeInTheDocument();
    expect(screen.getByText("대회 1등")).toBeInTheDocument();
    expect(screen.getByText("퍼솔")).toBeInTheDocument();

    const metrics = screen.getByRole("list", { name: "기타 통계" });
    expect(within(metrics).getByText("1,234회")).toBeInTheDocument();
    expect(within(metrics).getByText("5개")).toBeInTheDocument();
    expect(within(metrics).getByText("5회")).toBeInTheDocument();
    expect(within(metrics).getByText("7회")).toBeInTheDocument();
  });

  it("orders the legend by submission count and maps every known source label", () => {
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      languages: languageItems,
      totalSubmissions: 15,
    };

    const { container } = render(<MoreOverview dashboard={dashboard} />);

    const legend = screen.getByRole("list", { name: "언어별 제출 분포" });
    const rows = within(legend).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "PyPy 35회 (33.3%)",
      "C++204회 (26.7%)",
      "Python 33회 (20%)",
      "C++172회 (13.3%)",
      "Custom JSON1회 (6.7%)",
    ]);
    expect(container.querySelectorAll(".recharts-pie-sector")).toHaveLength(5);
  });

  it("presents unavailable language data without rendering an empty legend", () => {
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      languages: [],
      totalSubmissions: 0,
    };

    render(<MoreOverview dashboard={dashboard} />);

    expect(screen.getByRole("status")).toHaveTextContent("언어별 제출 집계 미제공");
    expect(screen.queryByRole("list", { name: "언어별 제출 분포" })).not.toBeInTheDocument();
  });
});
