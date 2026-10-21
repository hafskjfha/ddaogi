import type { Metadata } from "next";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { normalizeWikiQuery, searchWiki } from "@/features/dojstory/data/queryWiki";
import { ResearchCatalog } from "@/features/dojstory/components/ResearchCatalog";
import { WikiSearchForm } from "@/features/dojstory/components/WikiSearchForm";
import { ResearchGraph } from "@/features/dojstory/components/ResearchGraph";
export const metadata: Metadata = { title: "연구 도감 · DOJstory", description: "확보된 공정연구의 선행 조건, 요구치와 소비 비용" };

export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadDojstoryWiki();
  const query = { ...normalizeWikiQuery(await searchParams), kind: "research" as const, slot: "" };
  const matches = searchWiki(data, query);
  const byId = new Map(data.research.map((entry) => [entry.id, entry]));
  const searching = Boolean(query.q.trim());
  return <>
    <header><h1>연구 도감</h1><p className="wiki-muted">현재 수록 연구 {data.research.length}개. 수집 계정에서 확인한 범위이며 전체 연구 트리가 아닙니다.</p></header>
    <WikiSearchForm query={query} action="/dojstory/research" fixedKind="research" />
    <ResearchGraph research={data.research} highlightedIds={searching ? matches.map((entry) => entry.id) : undefined} />
    <section aria-label="연구 목록"><h2>{searching ? `검색 결과 ${matches.length}개` : "연구 목록"}</h2><ResearchCatalog research={matches.map((entry) => byId.get(entry.id)!)} /></section>
  </>;
}
