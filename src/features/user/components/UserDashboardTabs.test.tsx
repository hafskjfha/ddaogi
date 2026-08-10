import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserDashboardTabs } from "@/features/user/components/UserDashboardTabs";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("UserDashboardTabs", () => {
  it("switches among rating, problem, and other analytics", async () => {
    const user = userEvent.setup();
    render(<UserDashboardTabs dashboard={userDashboardFixture} />);

    expect(screen.getByRole("tablist", { name: "유저 분석 범주" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "레이팅" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tabpanel", { name: "레이팅" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "문제" }));
    expect(screen.getByText("만점 미달")).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "문제" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "기타 정보" }));
    expect(screen.getByText("PyPy 3")).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "기타 정보" })).toBeInTheDocument();
  });

  it("supports arrow-key navigation and preserves inactive panel state without remounting", async () => {
    const user = userEvent.setup();
    render(<UserDashboardTabs dashboard={userDashboardFixture} />);

    const ratingTab = screen.getByRole("tab", { name: "레이팅" });
    const ratingPanel = screen.getByRole("tabpanel", { name: "레이팅" });
    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(screen.getByText("퍼포먼스 변화")).toBeInTheDocument();

    ratingTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "문제" })).toHaveAttribute("data-state", "active");
    expect(screen.queryByRole("tabpanel", { name: "레이팅" })).not.toBeInTheDocument();

    await user.click(ratingTab);
    expect(screen.getByRole("tabpanel", { name: "레이팅" })).toBe(ratingPanel);
    expect(screen.getByText("퍼포먼스 변화")).toBeInTheDocument();
  });
});
