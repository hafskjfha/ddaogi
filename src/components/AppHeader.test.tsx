import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/AppHeader";

const contestUrl = "/contests/doj-beginner-contest-4";

describe("AppHeader", () => {
  it("links to both supported analytics destinations", () => {
    render(<AppHeader />);
    const navigation = screen.getByRole("navigation", { name: "주요 메뉴" });

    expect(within(navigation).getByRole("link", { name: "유저 분석" })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
    expect(within(navigation).getByRole("link", { name: "대회 분석" })).toHaveAttribute(
      "href",
      contestUrl,
    );
    expect(within(navigation).queryByText("준비 중")).not.toBeInTheDocument();
  });
});
