import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RatingDelta, RatingText, RatingTitleText } from "@/components/RatingText";

describe("rating text primitives", () => {
  it("uses rating bands and neutral, positive, and negative delta semantics", () => {
    render(
      <>
        <RatingText rating={1429}>1,429</RatingText>
        <RatingText rating={2286}>2,286</RatingText>
        <RatingTitleText title="MASTER">MASTER</RatingTitleText>
        <RatingDelta value={53} />
        <RatingDelta value={-8} />
        <RatingDelta value={0} />
        <RatingDelta value={null} />
      </>,
    );

    expect(screen.getByText("1,429")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(screen.getByText("2,286")).toHaveClass("text-red-700", "dark:text-red-400");
    expect(screen.getByText("MASTER")).toHaveClass("text-orange-700", "dark:text-orange-400");
    expect(screen.getByText("+53")).toHaveClass("text-emerald-700", "dark:text-emerald-400");
    expect(screen.getByText("-8")).toHaveClass("text-red-700", "dark:text-red-400");
    expect(screen.getByText("0")).toHaveClass("text-slate-700", "dark:text-slate-300");
    expect(screen.getByText("-")).toHaveClass("text-slate-500", "dark:text-slate-400");
  });
});
