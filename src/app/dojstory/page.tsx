import Link from "next/link";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { normalizeWikiQuery, searchWiki } from "@/features/dojstory/data/queryWiki";
import { WikiSearchForm } from "@/features/dojstory/components/WikiSearchForm";
import { SourceReferences } from "@/features/dojstory/components/SourceReferences";
import { CheckedAt, WikiPanel } from "@/features/dojstory/components/WikiPrimitives";

/** Searches only the currently collected catalog and discloses its limits. */
export default async function WikiHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadDojstoryWiki();
  const query = normalizeWikiQuery(await searchParams);
  const results = searchWiki(data, query);
  const active = Boolean(query.q.trim() || query.kind !== "all" || query.slot);
  return <>
    <header className="wiki-hero"><span className="wiki-kicker">문제를 풀고, 다음 가능성을 찾는 곳</span><h1>DOJstory 위키</h1><p>장비에서 연구, 공방까지.<br className="sm:hidden" /> 필요한 조건과 출처를 함께 살펴보세요.</p></header>
    <WikiPanel><h2>현재 수록분</h2><p className="wiki-statline">장비 {data.items.filter((item) => item.kind === "equipment").length}개 · 연구 {data.research.length}개 · 광산 {data.workshop.mines.length}종 · 가이드 {data.guides.length}개</p><p className="wiki-muted">일부만 확보된 자료입니다. 제공 자료 기재와 미확인, 추정·전언을 구분하며 독립적인 공식 검증을 의미하지 않습니다.</p></WikiPanel>
    <WikiSearchForm query={query} />
    <section aria-label="위키 항목"><div className="wiki-section-heading"><h2>{active ? `검색 결과 ${results.length}개` : "수록 항목 둘러보기"}</h2>{active && <Link href="/dojstory">검색 초기화</Link>}</div>
      {!results.length ? <WikiPanel><p>{active ? "검색 조건에 맞는 항목이 없습니다. 다른 이름이나 필터로 검색해 주세요." : "아직 수록된 항목이 없습니다. 자료를 수집하고 있습니다."}</p></WikiPanel> : <ul className="wiki-result-grid">{results.map((entry) => <li key={entry.id}><Link href={entry.href} className="wiki-result"><span className="wiki-kicker">{{ item: "아이템", research: "연구", guide: "가이드", workshop: "공방·광산" }[entry.kind]}</span><strong>{entry.title}</strong><span className="wiki-muted">{entry.summary}</span><span className="wiki-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>}
    </section>
    <WikiPanel><h2>자료 기준과 수록 상태</h2><p>연구는 수집 계정 DOJpower 219.99에서 보인 범위입니다. 방문자의 개인별 해금 여부와 연결하지 않습니다.</p><p>조합법의 투입·산출 수량, 장비 획득처와 일부 수치는 자료가 더 필요합니다. 장비·잠재 원문의 확인일은 미확인입니다.</p><ul className="wiki-source-dates">{data.sources.map((source) => <li key={source.id}><strong>{source.title}</strong><CheckedAt evidence={source.checkedAt} /></li>)}</ul></WikiPanel>
    <SourceReferences refs={data.sources.map((source) => ({ sourceId: source.id, section: "전체 자료" }))} />
  </>;
}
