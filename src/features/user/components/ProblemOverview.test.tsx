import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { parseProblemTier } from "@/domain/problemTier";
import { ProblemOverview } from "@/features/user/components/ProblemOverview";
import type { DistributionItem, UserDashboardData } from "@/features/user/model/types";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

const detailItems: readonly DistributionItem[] = [
  {
    key: "ruby-1",
    label: "Ruby I",
    shortLabel: "R1",
    count: 0,
    percentage: 0,
    color: "#ff0062",
    totalAvailable: 2,
  },
  {
    key: "bronze-5",
    label: "Bronze V",
    shortLabel: "B5",
    count: 1,
    percentage: 100,
    color: "#ad5600",
    totalAvailable: 1,
  },
  {
    key: "unrated",
    label: "Unrated",
    shortLabel: "U",
    count: 0,
    percentage: 0,
    color: "#64748b",
    totalAvailable: 0,
  },
];

const groupItems: readonly DistributionItem[] = [
  {
    key: "ruby",
    label: "Ruby",
    shortLabel: "R",
    count: 0,
    percentage: 0,
    color: "#ff0062",
    totalAvailable: 2,
  },
  {
    key: "bronze",
    label: "Bronze",
    shortLabel: "B",
    count: 1,
    percentage: 100,
    color: "#ad5600",
    totalAvailable: null,
  },
  {
    key: "unrated",
    label: "Unrated",
    shortLabel: "U",
    count: 0,
    percentage: 0,
    color: "#64748b",
    totalAvailable: 0,
  },
];

const analyticsFixture: UserDashboardData = {
  ...userDashboardFixture,
  difficultyGroups: groupItems,
  difficultyDetails: detailItems,
};

describe("ProblemOverview", () => {
  it("gives each non-empty problem list its own bounded keyboard-scrollable region", () => {
    render(<ProblemOverview dashboard={userDashboardFixture} />);

    const solvedRegion = screen.getByRole("region", { name: "만점 문제 목록" });
    const partialRegion = screen.getByRole("region", { name: "만점 미달 목록" });

    for (const region of [solvedRegion, partialRegion]) {
      expect(region).toHaveAttribute("tabindex", "0");
      expect(region).toHaveClass(
        "max-h-[32rem]",
        "overflow-y-auto",
        "overscroll-contain",
        "pe-2",
      );
    }
  });

  it("renders tier-group badges while preserving safe links and partial score context", async () => {
    const user = userEvent.setup();
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      problems: [
        {
          ...userDashboardFixture.problems[0],
          id: "94",
          title: "Unrated Problem",
          tier: parseProblemTier(),
        },
        {
          ...userDashboardFixture.problems[1],
          id: "65",
          title: "Gold Problem",
          tier: parseProblemTier("Gold I"),
        },
      ],
    };
    render(<ProblemOverview dashboard={dashboard} />);

    const unratedLink = screen.getByRole("link", { name: /94.*Unrated Problem/ });
    const goldLink = screen.getByRole("link", { name: /65.*Gold Problem/ });
    expect(within(unratedLink).getByText("UR")).toHaveClass("bg-black", "text-white");
    expect(within(goldLink).getByText("G1")).toHaveClass("bg-[#ec9a00]", "text-slate-950");
    expect(goldLink).toHaveAttribute("target", "_blank");
    expect(goldLink).toHaveAttribute("rel", "noreferrer");

    await user.hover(goldLink);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gold Problem");
    expect(screen.getByRole("tooltip")).toHaveTextContent("34 / 100점");
  });

  it("separates solved and partial problems and toggles tier detail", async () => {
    const user = userEvent.setup();
    render(<ProblemOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("만점 문제")).toBeInTheDocument();
    expect(screen.getByText("만점 미달")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /두 수열/ })).toHaveAttribute(
      "href",
      "https://doj.kr/ko/problems/342",
    );
    expect(screen.getByText("34 / 100점")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "자세히 보기" }));
    expect(screen.getByText("Bronze I")).toBeInTheDocument();
    expect(screen.getByText("집계 미제공")).toBeInTheDocument();
  });

  it("keeps complete problem identifiers available when titles are truncated", async () => {
    const user = userEvent.setup();
    render(<ProblemOverview dashboard={userDashboardFixture} />);

    const solvedProblem = screen.getByRole("link", { name: /두 수열/ });
    expect(solvedProblem).toHaveAttribute("target", "_blank");
    expect(solvedProblem).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("두 수열")).toHaveClass("truncate");

    await user.hover(solvedProblem);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("두 수열");
  });

  it("includes partial score context in problem tooltips without changing solved tooltips", async () => {
    const user = userEvent.setup();
    const partialView = render(<ProblemOverview dashboard={userDashboardFixture} />);
    const partialProblem = screen.getByRole("link", { name: /직사각형 1/ });

    expect(partialProblem).toHaveAttribute("target", "_blank");
    expect(partialProblem).toHaveAttribute("rel", "noreferrer");
    await user.hover(partialProblem);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("직사각형 1");
    expect(screen.getByRole("tooltip")).toHaveTextContent("34 / 100점");

    partialView.unmount();
    render(<ProblemOverview dashboard={userDashboardFixture} />);
    const solvedProblem = screen.getByRole("link", { name: /두 수열/ });
    solvedProblem.focus();
    fireEvent.focus(solvedProblem);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("두 수열");
    expect(screen.getByRole("tooltip")).not.toHaveTextContent("100 / 100점");
  });

  it("renders keyboard-readable first-full activity with normalized streak summaries", async () => {
    render(<ProblemOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("현재 연속 1일")).toBeInTheDocument();
    expect(screen.getByText("최장 연속 1일")).toBeInTheDocument();
    const activity = screen.getByRole("button", { name: "2026-07-08: 1개 해결" });
    expect(activity).toBeInTheDocument();

    activity.focus();
    expect(activity).toHaveFocus();
    fireEvent.focus(activity);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("2026년 7월 8일");
  });

  it("starts the weekly heatmap on the earliest first-full solve and preserves intensity steps", () => {
    const dashboard: UserDashboardData = {
      ...userDashboardFixture,
      problemSolveStreak: {
        asOf: "2026-07-09",
        current: 2,
        longest: 3,
        days: [
          { date: "2026-07-01", count: 0 },
          { date: "2026-07-02", count: 1 },
          { date: "2026-07-03", count: 2 },
          { date: "2026-07-04", count: 3 },
          { date: "2026-07-05", count: 4 },
          { date: "2026-07-06", count: 5 },
          { date: "2026-07-07", count: 0 },
          { date: "2026-07-08", count: 1 },
          { date: "2026-07-09", count: 1 },
        ],
      },
    };
    render(<ProblemOverview dashboard={dashboard} />);

    expect(screen.queryByRole("button", { name: "2026-07-01: 0개 해결" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026-07-05: 4개 해결" })).toHaveClass(
      "bg-emerald-500",
    );
    expect(screen.getByRole("button", { name: "2026-07-06: 5개 해결" })).toHaveClass(
      "bg-emerald-600",
    );
  });

  it("orders group and tier legends and only marks known fully solved availability", async () => {
    const user = userEvent.setup();
    render(<ProblemOverview dashboard={analyticsFixture} />);

    const groupLegend = screen.getByRole("list", { name: "난이도 그룹 분포" });
    expect(groupLegend).toHaveTextContent("Unrated");
    expect(groupLegend).toHaveTextContent("Bronze");
    expect(groupLegend).toHaveTextContent("Ruby");
    expect(groupLegend.textContent?.indexOf("Unrated")).toBeLessThan(
      groupLegend.textContent?.indexOf("Bronze") ?? Number.POSITIVE_INFINITY,
    );
    expect(groupLegend.textContent?.indexOf("Bronze")).toBeLessThan(
      groupLegend.textContent?.indexOf("Ruby") ?? Number.POSITIVE_INFINITY,
    );
    expect(groupLegend).toHaveTextContent("1개 (100%)");
    expect(screen.queryByLabelText("Bronze 전체 해결")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Unrated 전체 해결")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "자세히 보기" }));
    const detailLegend = screen.getByRole("list", { name: "난이도 상세 분포" });
    expect(detailLegend.textContent?.indexOf("Unrated")).toBeLessThan(
      detailLegend.textContent?.indexOf("Bronze V") ?? Number.POSITIVE_INFINITY,
    );
    expect(detailLegend.textContent?.indexOf("Bronze V")).toBeLessThan(
      detailLegend.textContent?.indexOf("Ruby I") ?? Number.POSITIVE_INFINITY,
    );
    expect(screen.getByLabelText("Bronze V 전체 해결")).toBeInTheDocument();
  });
});
