import type { Metadata } from "next";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { normalizeWikiQuery, searchWiki } from "@/features/dojstory/data/queryWiki";
import { ItemCatalog } from "@/features/dojstory/components/ItemCatalog";
import { WikiSearchForm } from "@/features/dojstory/components/WikiSearchForm";
export const metadata: Metadata = { title: "아이템 도감 · DOJstory", description: "현재 확보한 장비와 이름만 확인된 아이템을 탐색합니다." };

export default async function ItemsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadDojstoryWiki();
  const query = { ...normalizeWikiQuery(await searchParams), kind: "item" as const };
  const matches = searchWiki(data, query);
  const byId = new Map(data.items.map((item) => [item.id, item]));
  return <><header><h1>아이템 도감</h1><p className="wiki-muted">장비 {data.items.filter((item) => item.kind === "equipment").length}개와 이름만 확보한 항목을 수록했습니다. 부위를 고르면 해당 장비만 표시합니다.</p></header><WikiSearchForm query={query} action="/dojstory/items" fixedKind="item" /><p className="wiki-muted">현재 조건의 수록 항목 {matches.length}개</p><ItemCatalog items={matches.map((match) => byId.get(match.id)!)} /></>;
}
