import { render, screen, cleanup } from "@testing-library/react";
import { expect, it } from "vitest";
import { loadDojstoryWiki } from "../data/loadDojstoryWiki";
import { getWikiRelations } from "../data/buildWikiRelations";
import { ResearchDetails } from "./ResearchDetails";

it("keepsAccessAlternativeSeparateFromPrerequisites", async () => {
  const data = await loadDojstoryWiki();
  const crystal = data.research.find((entry) => entry.slug === "crystal-compression")!;
  render(<ResearchDetails research={crystal} related={getWikiRelations(data, crystal.id)} />);
  expect(screen.getByText(/DOJpower 50 이상 또는 가치의 증표 착용/)).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /기초 가공/ })[0]).toHaveAttribute("href", "/dojstory/research/basic-processing");
  expect(screen.getByText("무료 (0 토큰)")).toBeInTheDocument();
  expect(screen.getByText("30분")).toBeInTheDocument();
  expect(screen.queryByText(/해금 가능|해금 불가/)).not.toBeInTheDocument();
  cleanup();
  const aurora = data.research.find((entry) => entry.slug === "aurora-synthesis")!;
  render(<ResearchDetails research={aurora} related={getWikiRelations(data, aurora.id)} />);
  expect(screen.getByText(/선행 연구 모두 충족/)).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /결정 압축/ })[0]).toHaveAttribute("href", "/dojstory/research/crystal-compression");
  expect(screen.getAllByRole("link", { name: /광학 분리 I/ })[0]).toHaveAttribute("href", "/dojstory/research/optical-separation-1");
});

it("appliesCorrectedEffectsAndConsumedMaterials", async () => {
  const data = await loadDojstoryWiki();
  for (const slug of ["aurora-synthesis", "crystal-compression"]) {
    const entry = data.research.find((entry) => entry.slug === slug)!;
    render(<ResearchDetails research={entry} related={getWikiRelations(data, entry.id)} />);
    expect(screen.getByText(/별도 조합법 획득 필요/)).toBeInTheDocument();
    if (slug === "aurora-synthesis") expect(screen.getByText("오로라 프리즘 제작법 해금")).toBeInTheDocument();
    cleanup();
  }
  for (const slug of ["optical-separation-1", "chemical-engineering", "optical-separation-2"]) {
    const entry = data.research.find((entry) => entry.slug === slug)!;
    render(<ResearchDetails research={entry} related={getWikiRelations(data, entry.id)} />);
    if (slug !== "optical-separation-2") expect(screen.getByText("효과 없음")).toBeInTheDocument();
    if (slug !== "optical-separation-1") expect(screen.getByText(/기초 과학 연구 키트 10개/)).toBeInTheDocument();
    cleanup();
  }
});
