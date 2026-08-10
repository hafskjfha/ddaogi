import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";

describe("UserProfileHero", () => {
  it("renders the supplied profile metrics, styles, and accessible fallbacks", () => {
    render(
      <UserProfileHero
        profile={{
          handle: "jtw7913",
          currentRating: 1429,
          maxRating: 1429,
          ratingRank: 89,
          ratingPercentile: 31.3,
          title: "SPECIALIST",
          titleColor: "rgb(20, 184, 166)",
          solvedCount: 90,
          podiumCount: 0,
          firstFullCount: 0,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "jtw7913" })).toBeInTheDocument();
    expect(screen.getByText("SPECIALIST")).toHaveStyle({ color: "rgb(20, 184, 166)" });
    expect(
      screen.getByRole("img", { name: "jtw7913 프로필 이미지 대체 표시" }),
    ).toHaveClass("rounded-full");
    expect(screen.getByLabelText("jtw7913 장착 플랜카드 대체 표시")).toBeInTheDocument();
    expect(screen.getByText("89등 · top 31.3%")).toBeInTheDocument();
    expect(screen.getByText("현재 1,429")).toHaveStyle({ color: "rgb(20, 184, 166)" });
    expect(screen.getByText("최고 1,429")).toBeInTheDocument();
    expect(screen.getByText("90문제")).toBeInTheDocument();
  });
});
