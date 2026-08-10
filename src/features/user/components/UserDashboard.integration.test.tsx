import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotFound from "@/app/not-found";
import UserDashboardError from "@/app/users/[handle]/error";
import UserDashboardLoading from "@/app/users/[handle]/loading";
import { UserDashboardTabs } from "@/features/user/components/UserDashboardTabs";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("user dashboard composition", () => {
  it("renders identity and the three required analytics categories", () => {
    render(
      <>
        <UserProfileHero profile={userDashboardFixture.profile} />
        <UserDashboardTabs dashboard={userDashboardFixture} />
      </>,
    );

    expect(screen.getByRole("heading", { name: "jtw7913" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "레이팅" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "문제" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "기타 정보" })).toBeInTheDocument();
  });

  it("announces profile and three analytics-card loading placeholders", () => {
    render(<UserDashboardLoading />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "유저 대시보드를 불러오는 중입니다.",
    );
    expect(screen.getByRole("region", { name: "프로필 불러오는 중" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "분석 카드 불러오는 중" })).toHaveLength(3);
  });

  it("offers retry and home recovery controls after a route error", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const error = new Error("fixture route failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<UserDashboardError error={error} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("유저 정보를 불러오지 못했습니다.");
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it("keeps the Korean not-found recovery path available", () => {
    const { container } = render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없습니다." }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('a[href="/contests/doj-beginner-contest-4"]'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "유저 분석 보기" })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "지원 대회 보기" })).not.toBeInTheDocument();
  });
});
