import { cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { resolve } from "node:path";
import ResearchPage from "@/app/dojstory/research/[slug]/page";
import ItemPage from "@/app/dojstory/items/[slug]/page";
import MinePage from "@/app/dojstory/workshop/mines/[slug]/page";
import GuidePage from "@/app/dojstory/guides/[slug]/page";
import SourcePage from "@/app/dojstory/sources/[sourceId]/page";
import WikiError from "@/app/dojstory/error";
import WikiNotFound from "@/app/dojstory/not-found";
import { loadDojstoryWiki } from "../data/loadDojstoryWiki";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

it("navigatesCollectedResearchAndItems", async () => {
  render(await ResearchPage({ params: Promise.resolve({ slug: "basic-processing" }) }));
  expect(screen.getByRole("link", { name: "결정 압축 →" })).toHaveAttribute("href", "/dojstory/research/crystal-compression");
  cleanup();
  render(await ResearchPage({ params: Promise.resolve({ slug: "crystal-compression" }) }));
  expect(screen.getByRole("link", { name: "베이직 프리즘 상세 →" })).toHaveAttribute("href", "/dojstory/items/basic-prism");
  expect(screen.getByRole("link", { name: "기초 가공 →" })).toHaveAttribute("href", "/dojstory/research/basic-processing");
  expect(screen.getByRole("link", { name: "공정연구 원문" })).toHaveAttribute("href", "/dojstory/sources/research");
  expect(document.querySelector('a[href*="/recipes"]')).toBeNull();
  cleanup();
  render(await ItemPage({ params: Promise.resolve({ slug: "basic-prism" }) }));
  expect(screen.getByRole("heading", { name: "베이직 프리즘" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "결정 압축 →" })).toHaveAttribute("href", "/dojstory/research/crystal-compression");
});

it("handlesUnknownSlugsAndSourceFailure", async () => {
  for (const page of [ItemPage, ResearchPage, MinePage, GuidePage]) await expect(page({ params: Promise.resolve({ slug: "not-collected" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  await expect(SourcePage({ params: Promise.resolve({ sourceId: "not-collected" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  render(<WikiNotFound />);
  expect(screen.getByRole("heading", { name: "없는 위키 문서입니다" })).toBeInTheDocument();
  cleanup();
  const data = await loadDojstoryWiki();
  data.items.push(data.items[0]);
  try { await expect(ItemPage({ params: Promise.resolve({ slug: "basic-chair" }) })).rejects.toThrow(/자료 검증 실패/); }
  finally { data.items.pop(); }
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(resolve("docs", "missing-source-root"));
  try { await expect(SourcePage({ params: Promise.resolve({ sourceId: "equipment" }) })).rejects.toThrow(/ENOENT/); }
  finally { cwd.mockRestore(); }
  render(<WikiError error={new Error("read failed")} retry={() => {}} />);
  expect(screen.getByRole("alert")).toHaveTextContent("위키 자료를 불러오지 못했습니다");
});

it("showsSourceMarkupAsInertText", async () => {
  const { container } = render(await SourcePage({ params: Promise.resolve({ sourceId: "equipment" }) }));
  expect(container.querySelector("pre")?.textContent).toContain("<svg");
  expect(container.querySelector("svg")).toBeNull();
  expect(container.querySelector("script")).toBeNull();
});
