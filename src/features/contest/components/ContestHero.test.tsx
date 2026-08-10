import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContestHero } from "@/features/contest/components/ContestHero";
import type { ContestSummary } from "@/features/contest/model/types";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("ContestHero", () => {
  it("shows the normalized contest identity, schedule, format, and organizers", () => {
    render(<ContestHero contest={contestDashboardFixture.contest} />);

    expect(screen.getByRole("heading", { name: "DOJ Beginner Contest 4" })).toBeInTheDocument();
    expect(screen.getByText("2026년 7월 8일 오후 9:00")).toBeInTheDocument();
    expect(screen.getByText("2026년 7월 8일 오후 10:40")).toBeInTheDocument();
    expect(screen.getByText("100분")).toBeInTheDocument();
    expect(screen.getByText("~2400 rated")).toBeInTheDocument();
    expect(screen.getByText("난이도순")).toBeInTheDocument();
    expect(screen.getByText("일반")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("lunarlity")).toBeInTheDocument();
  });

  it("explains both regular and window participation from a keyboard-focusable trigger", async () => {
    const user = userEvent.setup();
    render(<ContestHero contest={contestDashboardFixture.contest} />);

    const trigger = screen.getByRole("button", { name: "일반 참가 방식 설명" });
    trigger.focus();

    expect(trigger).toHaveFocus();
    expect(
      await screen.findByText(/일반은 모든 참가자가 같은 시작 시각에 시작합니다/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/window는 대회가 열려 있는 동안 원하는 시각에 시작합니다/),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
  });

  it("labels a window-format contest without changing the supplied schedule", () => {
    const windowContest: ContestSummary = {
      ...contestDashboardFixture.contest,
      participationType: "window",
    };

    render(<ContestHero contest={windowContest} />);

    expect(screen.getByText("window")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "window 참가 방식 설명" })).toBeInTheDocument();
    expect(screen.getByText("2026년 7월 8일 오후 9:00")).toBeInTheDocument();
    expect(screen.getByText("2026년 7월 8일 오후 10:40")).toBeInTheDocument();
  });
});
