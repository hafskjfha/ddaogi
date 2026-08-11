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

    for (const name of ["이용 전 확인해 주세요", "유저 분석", "대회 분석"]) {
      expect(screen.getByRole("heading", { name, level: 2 })).toBeInTheDocument();
    }
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

  it("links the feature cards to their analysis index pages", () => {
    render(<Home />);

    for (const [name, href] of [
      ["유저 분석 페이지로 이동", "/users"],
      ["대회 분석 페이지로 이동", "/contests"],
    ]) {
      const link = screen.getByRole("link", { name });

      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-slate-950",
        "focus-visible:ring-offset-2",
        "dark:focus-visible:ring-slate-300",
        "dark:focus-visible:ring-offset-slate-950",
      );

      const card = link.querySelector("section");
      if (!(card instanceof HTMLElement)) throw new Error(`${name} card is missing`);

      expect(card).toHaveClass(
        "h-full",
        "transition-all",
        "group-hover:-translate-y-0.5",
        "group-hover:border-blue-300",
        "group-hover:shadow-md",
        "dark:group-hover:border-blue-800",
      );
    }
  });

  it("keeps demo links visibly focused in dark mode", () => {
    render(<Home />);

    for (const name of ["유저 분석 데모 보기", "대회 분석 데모 보기"]) {
      expect(screen.getByRole("link", { name })).toHaveClass(
        "focus-visible:ring-offset-2",
        "dark:focus-visible:ring-slate-300",
        "dark:focus-visible:ring-offset-slate-950",
      );
    }
  });
});
