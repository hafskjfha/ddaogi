import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import ResearchPage from "./page";

it("searchesResearchWithoutRemovingPrerequisiteContext", async () => {
  render(await ResearchPage({ searchParams: Promise.resolve({ q: "오로라" }) }));
  expect(screen.getByRole("heading", { name: "검색 결과 1개" })).toBeInTheDocument();
  const graph = screen.getByRole("group", { name: "연구 선행 관계 그래프" });
  expect(within(graph).getAllByRole("link")).toHaveLength(12);
  expect(within(graph).getByRole("link", { name: "오로라 합성 연구 상세" })).toHaveAttribute("data-match", "true");
  expect(within(screen.getByRole("region", { name: "연구 목록" })).getByRole("link", { name: /오로라 합성/ })).toHaveAttribute("href", "/dojstory/research/aurora-synthesis");
});

it("showsNoMatchesAsAnEmptyListWhileKeepingTheCollectedGraph", async () => {
  render(await ResearchPage({ searchParams: Promise.resolve({ q: "없는항목xyz" }) }));
  expect(screen.getByRole("heading", { name: "검색 결과 0개" })).toBeInTheDocument();
  expect(screen.getByText("검색 조건에 맞는 연구가 없습니다.")).toBeInTheDocument();
  expect(within(screen.getByRole("group", { name: "연구 선행 관계 그래프" })).getAllByRole("link")).toHaveLength(12);
});
