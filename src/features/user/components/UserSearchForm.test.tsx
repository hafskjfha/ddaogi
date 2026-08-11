import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserSearchForm } from "@/features/user/components/UserSearchForm";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("UserSearchForm", () => {
  beforeEach(() => pushMock.mockReset());

  it("navigates a normalized supported handle to its detail page", async () => {
    const user = userEvent.setup();
    render(<UserSearchForm />);

    await user.type(screen.getByRole("textbox", { name: "유저 핸들" }), " JTW7913 ");
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(pushMock).toHaveBeenCalledWith("/users/jtw7913");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["", "another-user"])("shows an inline error for unsupported value %j", async (value) => {
    const user = userEvent.setup();
    render(<UserSearchForm />);

    if (value) await user.type(screen.getByRole("textbox", { name: "유저 핸들" }), value);
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("현재는 jtw7913만 검색할 수 있어요.");
  });

  it("clears submitted invalid state when the query is edited", async () => {
    const user = userEvent.setup();
    render(<UserSearchForm />);

    const input = screen.getByRole("textbox", { name: "유저 핸들" });
    await user.click(screen.getByRole("button", { name: "검색" }));
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.type(input, "j");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
