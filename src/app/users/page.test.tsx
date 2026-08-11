import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UsersPage from "@/app/users/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("UsersPage", () => {
  it("provides the supported user search and profile entry", () => {
    render(<UsersPage />);

    expect(screen.getByRole("heading", { name: "유저 분석" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "유저 핸들" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "jtw7913", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("SPECIALIST")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(
      screen.getByText("현재 이용 가능한 데모 프로필입니다. 현재는 jtw7913만 제공됩니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("현재 레이팅 1,429")).toBeInTheDocument();
    expect(screen.getByText("만점 문제 90개")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "프로필 분석 보기" })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
  });
});
