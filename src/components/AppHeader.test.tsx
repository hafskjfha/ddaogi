import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/AppHeader";

const unavailableContestUrl = "/contests/doj-beginner-contest-4";

describe("AppHeader", () => {
  it("keeps the planned contest destination visible without making it actionable", () => {
    const { container } = render(<AppHeader />);
    const navigation = screen.getByRole("navigation", { name: "주요 메뉴" });

    expect(container.querySelector(`a[href="${unavailableContestUrl}"]`)).not.toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "유저 분석" })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );

    const plannedContest = within(navigation).getByRole("link", {
      name: "대회 분석 준비 중",
    });
    expect(plannedContest).toHaveAttribute("aria-disabled", "true");
    expect(plannedContest).not.toHaveAttribute("href");
    expect(plannedContest).not.toHaveAttribute("tabindex");
    expect(within(plannedContest).getByText("준비 중")).toBeVisible();
  });
});
