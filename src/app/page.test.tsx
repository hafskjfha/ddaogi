import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("introduces the service and discloses its unofficial snapshot data", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "DOJ를 더 깊이 읽는 따오기" })).toBeInTheDocument();
    expect(screen.getByText(/DOJ에서 운영하는 공식 사이트가 아닌/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.08\.11 오전 2시/)).toBeInTheDocument();
    expect(screen.getByText(/실시간 데이터가 아닙니다/)).toBeInTheDocument();
  });

  it("links directly to both detail demos", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /유저 분석 데모 보기/ })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
    expect(screen.getByRole("link", { name: /대회 분석 데모 보기/ })).toHaveAttribute(
      "href",
      "/contests/doj-beginner-contest-4",
    );
  });
});
