import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContestPage from "@/app/contests/[contestSlug]/page";
import { loadContestDashboard } from "@/features/contest/data/loadContestDashboard";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/features/contest/data/loadContestDashboard", () => ({
  loadContestDashboard: vi.fn(),
}));

const loadContestDashboardMock = vi.mocked(loadContestDashboard);

describe("ContestPage", () => {
  beforeEach(() => {
    loadContestDashboardMock.mockReset();
  });

  it("awaits the route slug and maps the loaded DTO into the overview sections", async () => {
    loadContestDashboardMock.mockResolvedValue(contestDashboardFixture);

    render(
      await ContestPage({
        params: Promise.resolve({ contestSlug: "doj-beginner-contest-4" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(loadContestDashboardMock).toHaveBeenCalledWith("doj-beginner-contest-4");
    expect(screen.getByRole("heading", { name: "DOJ Beginner Contest 4" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rated 참가자 분포" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "문제 분석" })).not.toBeInTheDocument();
  });

  it("delegates unsupported contest slugs to the shared not-found boundary", async () => {
    loadContestDashboardMock.mockResolvedValue(null);

    await expect(
      ContestPage({
        params: Promise.resolve({ contestSlug: "unknown" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(loadContestDashboardMock).toHaveBeenCalledWith("unknown");
  });
});
