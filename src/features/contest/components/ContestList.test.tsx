import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestList } from "./ContestList";
import { CONTEST_CATALOG, paginateContests } from "../data/contestCatalog";

describe("ContestList", () => {
  it("shows the supported contest and disabled pagination controls on its only page", () => {
    render(<ContestList page={paginateContests(CONTEST_CATALOG, 1)} />);

    expect(
      screen.getByRole("heading", { name: "DOJ Beginner Contest 4", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "상세 분석 보기" })).toHaveAttribute(
      "href",
      "/contests/doj-beginner-contest-4",
    );
    expect(screen.getByText("1 / 1 페이지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("renders decorative metadata and pagination icons outside accessible labels", () => {
    render(<ContestList page={paginateContests(CONTEST_CATALOG, 1)} />);

    for (const label of ["개최일", "참가 유형", "대회 시간"]) {
      expect(screen.getByText(label).parentElement?.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    }

    expect(
      screen.getByRole("button", { name: "이전 페이지" }).querySelector("svg[aria-hidden='true']"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "다음 페이지" }).querySelector("svg[aria-hidden='true']"),
    ).not.toBeNull();
  });

  it("stacks the page status above full-width pagination controls on mobile", () => {
    render(<ContestList page={paginateContests(CONTEST_CATALOG, 1)} />);

    expect(screen.getByRole("navigation", { name: "대회 목록 페이지" })).toHaveClass(
      "grid",
      "w-full",
      "grid-cols-2",
      "sm:flex",
    );
    expect(screen.getByText("1 / 1 페이지")).toHaveClass("col-span-2", "sm:order-2");

    for (const name of ["이전 페이지", "다음 페이지"]) {
      expect(screen.getByRole("button", { name })).toHaveClass("w-full", "sm:w-auto");
    }
  });
});
