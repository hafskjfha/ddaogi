import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContestDashboardLoading from "@/app/contests/[contestSlug]/loading";

describe("ContestDashboardLoading", () => {
  it("announces the title, distribution, and nine accessible problem placeholders", () => {
    render(<ContestDashboardLoading />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "대회 대시보드를 불러오는 중입니다.",
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("region", { name: "대회 제목 불러오는 중" }),
    ).toHaveClass("motion-safe:animate-pulse");
    expect(
      screen.getByRole("region", { name: "Rated 참가자 분포 불러오는 중" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "문제 행 불러오는 중" })).toHaveLength(9);
    expect(screen.getByTestId("contest-title-skeleton")).toHaveClass("dark:bg-slate-800");
  });
});
