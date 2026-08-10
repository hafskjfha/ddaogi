import { render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UserDashboardError from "@/app/users/[handle]/error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UserDashboardError", () => {
  it("logs each error identity exactly once in Strict Mode", () => {
    const retry = vi.fn();
    const error = new Error("fixture user route failure");
    const nextError = new Error("later user route failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { rerender } = render(
      <StrictMode>
        <UserDashboardError error={error} retry={retry} />
      </StrictMode>,
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith(error);

    rerender(
      <StrictMode>
        <UserDashboardError error={nextError} retry={retry} />
      </StrictMode>,
    );

    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith(nextError);
  });

  it("logs a shared error once for each independent boundary instance", () => {
    const retry = vi.fn();
    const sharedError = new Error("shared user route failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <StrictMode>
        <UserDashboardError error={sharedError} retry={retry} />
      </StrictMode>,
    );
    render(
      <StrictMode>
        <UserDashboardError error={sharedError} retry={retry} />
      </StrictMode>,
    );

    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenNthCalledWith(1, sharedError);
    expect(consoleError).toHaveBeenNthCalledWith(2, sharedError);
  });
});
