import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContestDashboardError from "@/app/contests/[contestSlug]/error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContestDashboardError", () => {
  it("logs once and offers retry plus working contest and user recovery links", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const error = new Error("fixture contest route failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { rerender } = render(<ContestDashboardError error={error} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "대회 정보를 불러오지 못했습니다.",
    );
    rerender(<ContestDashboardError error={error} retry={retry} />);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(error);

    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "대회 분석으로" })).toHaveAttribute(
      "href",
      "/contests/doj-beginner-contest-4",
    );
    expect(screen.getByRole("link", { name: "유저 분석으로" })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
  });
});
