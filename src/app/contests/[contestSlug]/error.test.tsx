import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContestDashboardError from "@/app/contests/[contestSlug]/error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContestDashboardError", () => {
  it("logs each error identity once in Strict Mode and keeps every recovery action", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const error = new Error("fixture contest route failure");
    const nextError = new Error("later contest route failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { rerender } = render(
      <StrictMode>
        <ContestDashboardError error={error} retry={retry} />
      </StrictMode>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "대회 정보를 불러오지 못했습니다.",
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(error);

    rerender(
      <StrictMode>
        <ContestDashboardError error={nextError} retry={retry} />
      </StrictMode>,
    );
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith(nextError);

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
