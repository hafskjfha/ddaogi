import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContestPage from "@/app/contests/[contestSlug]/page";

describe("contest dashboard composition", () => {
  it("renders the complete linked analytics route from the real contest fixture", async () => {
    render(
      await ContestPage({
        params: Promise.resolve({ contestSlug: "doj-beginner-contest-4" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "DOJ Beginner Contest 4" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rated 참가자 분포" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "문제 분석" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").filter((link) =>
        link.getAttribute("href")?.startsWith("https://doj.kr/ko/contests/"),
      ),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("link").filter((link) =>
        link.getAttribute("href")?.startsWith("https://doj.kr/ko/problems/"),
      ),
    ).toHaveLength(9);

    const profileLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("https://doj.kr/ko/user/"),
    );
    expect(profileLinks).toHaveLength(12);
    expect(screen.getAllByRole("link", { name: "admin" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "lunarlity" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "jkrt" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "RreShi" })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "예상 레이팅 산출 방식" })).toBeInTheDocument();
    expect(screen.getByText("22점")).toBeInTheDocument();
    expect(screen.getByText("없음")).toBeInTheDocument();
    expect(screen.queryByText("아직 없음")).not.toBeInTheDocument();
  });
});
