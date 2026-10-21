import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { research } from "../../../../data/dojstory/research";
import { ResearchGraph } from "./ResearchGraph";

it("showsClickableResearchNodesAndDirectedMandatoryPrerequisites", () => {
  render(<ResearchGraph research={research} />);
  const graph = screen.getByRole("group", { name: "연구 선행 관계 그래프" });
  expect(within(graph).getAllByRole("link")).toHaveLength(12);
  expect(within(graph).getByRole("link", { name: "기초 가공 연구 상세" })).toHaveAttribute("href", "/dojstory/research/basic-processing");
  expect(within(graph).getAllByRole("img")).toHaveLength(14);
  expect(within(graph).getByRole("img", { name: "결정 압축 → 오로라 합성 (필수 선행)" })).toBeInTheDocument();
  expect(within(graph).getByRole("img", { name: "광학 분리 I → 오로라 합성 (필수 선행)" })).toBeInTheDocument();
  expect(screen.getByText(/들어오는 모든 선행 연구가 필요/)).toBeInTheDocument();
});

it("keepsTheFullGraphWhileHighlightingSearchMatches", () => {
  render(<ResearchGraph research={research} highlightedIds={["aurora-synthesis"]} />);
  const nodes = screen.getByRole("group", { name: "연구 선행 관계 그래프" });
  expect(within(nodes).getAllByRole("link")).toHaveLength(12);
  expect(within(nodes).getByRole("link", { name: "오로라 합성 연구 상세" })).toHaveAttribute("data-match", "true");
  expect(within(nodes).getByRole("link", { name: "결정 압축 연구 상세" })).toHaveAttribute("data-match", "false");
});
