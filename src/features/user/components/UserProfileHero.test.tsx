import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";

const SPECIALIST_COLOR = "rgb(20, 184, 166)";

describe("UserProfileHero", () => {
  it("consolidates supplied rank metrics in their respective cards", () => {
    render(
      <UserProfileHero
        profile={{
          handle: "jtw7913",
          introduction: "PS/CP 초보",
          currentRating: 1429,
          maxRating: 1429,
          ratingRank: 89,
          ratingPercentile: 31.3,
          title: "SPECIALIST",
          titleColor: SPECIALIST_COLOR,
          solvedCount: 90,
          solvedRank: 9,
          podiumCount: 0,
          firstPlaceCount: 0,
          firstFullCount: 0,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "jtw7913" })).toBeInTheDocument();
    expect(screen.getByText("SPECIALIST")).not.toHaveStyle({ color: SPECIALIST_COLOR });
    expect(screen.getByText("SPECIALIST").nextElementSibling).toHaveTextContent("PS/CP 초보");
    expect(
      screen.getByRole("img", { name: "jtw7913 프로필 이미지 대체 표시" }),
    ).toHaveClass("rounded-full");
    expect(screen.getByLabelText("jtw7913 장착 플랜카드 대체 표시")).toBeInTheDocument();
    expect(screen.queryByText("89등 · top 31.3%")).not.toBeInTheDocument();
    const ratingRankCard = screen.getByText("레이팅 랭킹").closest("div");
    if (!ratingRankCard) throw new Error("Rating-rank card is missing");
    expect(within(ratingRankCard).getByText("89등")).toBeInTheDocument();
    expect(within(ratingRankCard).getByText("top 31.3%")).toBeInTheDocument();
    expect(screen.getByText("현재 1,429")).not.toHaveStyle({ color: SPECIALIST_COLOR });
    expect(screen.getByText("최고 1,429")).toBeInTheDocument();
    expect(screen.getByText("90문제")).toBeInTheDocument();
    const solvedCard = screen.getByText("만점 문제 수").closest("div");
    if (!solvedCard) throw new Error("Full-score card is missing");
    expect(within(solvedCard).getByText("문제 풀이 랭킹: 9등")).toBeInTheDocument();
  });

  it("associates the rating percentile with a description-list term", () => {
    render(<UserProfileHero profile={specialistProfile} />);

    const percentile = screen.getByText("top 31.3%");
    expect(percentile.closest("dd")).not.toBeNull();
    expect(screen.getByText("레이팅 백분위")).toHaveClass("sr-only");
  });

  it("keeps the fallback avatar above the banner overlay", () => {
    render(<UserProfileHero profile={specialistProfile} />);

    expect(
      screen.getByRole("img", { name: "jtw7913 프로필 이미지 대체 표시" }),
    ).toHaveClass("relative", "z-10");
  });

  it("preserves multiline introductions without allowing long tokens to overflow", () => {
    render(
      <UserProfileHero
        profile={{ ...specialistProfile, introduction: "PS/CP 초보\n긴소개문장" }}
      />,
    );

    expect(screen.getByText(/PS\/CP 초보/)).toHaveTextContent("PS/CP 초보 긴소개문장");
    expect(screen.getByText(/PS\/CP 초보/)).toHaveClass("whitespace-pre-wrap", "break-words");
  });

  it("omits the introduction element when the profile introduction is empty", () => {
    render(<UserProfileHero profile={{ ...specialistProfile, introduction: "" }} />);

    expect(screen.getByText("SPECIALIST").nextElementSibling).toHaveProperty("tagName", "DL");
  });

  it("uses the canonical rating color as a high-contrast visual cue", () => {
    render(<UserProfileHero profile={specialistProfile} />);

    const ratingValues = [
      screen.getByText("SPECIALIST"),
      screen.getByText("현재 1,429"),
      screen.getByText("최고 1,429"),
    ];

    for (const value of ratingValues) {
      expect(value).not.toHaveStyle({ color: SPECIALIST_COLOR });
      expect(value).toHaveStyle({ borderColor: SPECIALIST_COLOR });
      expect(value).toHaveClass("text-slate-950", "dark:text-slate-50");
    }

    expect(contrastRatio("#020617", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#020617", "#f1f5f9")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#f8fafc", "#020617")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#f8fafc", "#0f172a")).toBeGreaterThanOrEqual(4.5);
  });
});

const specialistProfile = {
  handle: "jtw7913",
  introduction: "PS/CP 초보",
  currentRating: 1429,
  maxRating: 1429,
  ratingRank: 89,
  ratingPercentile: 31.3,
  title: "SPECIALIST",
  titleColor: SPECIALIST_COLOR,
  solvedCount: 90,
  solvedRank: 9,
  podiumCount: 0,
  firstPlaceCount: 0,
  firstFullCount: 0,
} as const;

function contrastRatio(foreground: string, background: string): number {
  const [foregroundRed, foregroundGreen, foregroundBlue] = parseHexColor(foreground);
  const [backgroundRed, backgroundGreen, backgroundBlue] = parseHexColor(background);
  const lighter = relativeLuminance(foregroundRed, foregroundGreen, foregroundBlue);
  const darker = relativeLuminance(backgroundRed, backgroundGreen, backgroundBlue);

  return (Math.max(lighter, darker) + 0.05) / (Math.min(lighter, darker) + 0.05);
}

function parseHexColor(value: string): readonly [number, number, number] {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

function relativeLuminance(red: number, green: number, blue: number): number {
  const [linearRed, linearGreen, linearBlue] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
}
