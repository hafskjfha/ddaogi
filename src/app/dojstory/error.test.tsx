import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import WikiError from "./error";

it("refetchesFailedDataUsingNextRetry", () => {
  const retry = vi.fn();
  render(<WikiError error={new Error("private path")} retry={retry} />);
  expect(screen.getByRole("alert")).toHaveTextContent("위키 자료를 불러오지 못했습니다");
  expect(screen.queryByText("private path")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(retry).toHaveBeenCalledOnce();
});
