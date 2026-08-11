import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportedUserCard } from "@/features/user/components/SupportedUserCard";
import { SUPPORTED_USER } from "@/features/user/data/userCatalog";

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
});
