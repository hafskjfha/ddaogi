import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportedUserCard } from "@/features/user/components/SupportedUserCard";
import { SUPPORTED_USER, type SupportedUserSummary } from "@/features/user/data/userCatalog";

const EXPERT_USER: SupportedUserSummary = {
  handle: "expert-user",
  href: "/users/expert-user",
  currentRating: 1600,
  solvedCount: 123,
};

describe("SupportedUserCard", () => {
  it("derives the SPECIALIST mint theme from the supported rating", () => {
    const { container } = render(<SupportedUserCard user={SUPPORTED_USER} />);
    const card = container.firstElementChild;
    if (!(card instanceof HTMLElement)) throw new Error("Supported user card is missing");

    expect(screen.getByText("SPECIALIST")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(screen.getByText("SPECIALIST")).not.toHaveClass("text-blue-700", "dark:text-blue-300");

    const icon = card.querySelector("svg");
    expect(icon).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(card).toHaveClass("border-s-4");
    expect(card).toHaveStyle({ borderInlineStartColor: "rgb(20, 184, 166)" });
  });

  it("derives the EXPERT blue theme from a 1600 rating", () => {
    const { container } = render(<SupportedUserCard user={EXPERT_USER} />);
    const card = container.firstElementChild;
    if (!(card instanceof HTMLElement)) throw new Error("Expert user card is missing");

    const title = screen.getByText("EXPERT");
    expect(title).toHaveClass("text-blue-700", "dark:text-blue-400");
    expect(screen.queryByText("SPECIALIST")).not.toBeInTheDocument();

    const icon = card.querySelector("svg");
    expect(icon).toHaveClass("text-blue-700", "dark:text-blue-400");
    expect(card).toHaveClass("border-s-4");
    expect(card).toHaveStyle({ borderInlineStartColor: "rgb(59, 130, 246)" });
  });
});
