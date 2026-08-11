import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/AppHeader";

describe("AppHeader", () => {
  it("links the brand and analytics navigation to their entry routes", () => {
    render(<AppHeader />);
    const navigation = screen.getByRole("navigation", { name: "주요 메뉴" });

    expect(screen.getByRole("link", { name: "따오기" })).toHaveAttribute("href", "/");
    expect(within(navigation).getByRole("link", { name: "유저 분석" })).toHaveAttribute(
      "href",
      "/users",
    );
    expect(within(navigation).getByRole("link", { name: "대회 분석" })).toHaveAttribute(
      "href",
      "/contests",
    );
    expect(within(navigation).queryByText("준비 중")).not.toBeInTheDocument();
  });
});
