import { equipmentSlots, type WikiQuery } from "../model/types";

/** GET filters remain shareable and survive reloads without client state. */
export function WikiSearchForm({ query, action = "/dojstory", fixedKind }: { query: WikiQuery; action?: string; fixedKind?: "item" | "research" }) {
  return <form action={action} method="get" className="wiki-search" role="search" aria-label="위키 검색">
    <label className="wiki-search-text">이름 검색<input name="q" defaultValue={query.q} type="search" placeholder="아이템, 연구, 가이드 이름" /></label>
    {fixedKind ? <input type="hidden" name="kind" value={fixedKind} /> : <label>분류<select name="kind" defaultValue={query.kind}><option value="all">전체 분류</option><option value="item">아이템</option><option value="research">연구</option><option value="guide">가이드</option><option value="workshop">공방·광산</option></select></label>}
    {fixedKind === "research" ? <input type="hidden" name="slot" value="" /> : <label>장비 부위<select name="slot" defaultValue={query.slot}><option value="">모든 부위</option>{Object.entries(equipmentSlots).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}
    <button type="submit">검색</button>
  </form>;
}
