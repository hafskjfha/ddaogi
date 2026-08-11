import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContestsPage from "@/app/contests/page";

describe("ContestsPage", () => {
  it("lists the supported contest analytics entry", async () => {
    render(await ContestsPage({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "대회 분석" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "상세 분석 보기" })).toHaveAttribute(
      "href",
      "/contests/doj-beginner-contest-4",
    );
  });
});
