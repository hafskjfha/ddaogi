import Link from "next/link";
import type { RelatedLink, WikiResearch } from "../model/types";
import { CheckedAt, EvidenceValue, RelatedLinks, WikiPanel, formatDuration, formatTokens } from "./WikiPrimitives";
import { SourceReferences } from "./SourceReferences";

/** Requires every prerequisite, independently of the power-or-equipment alternative. */
export function ResearchDetails({ research, related }: { research: WikiResearch; related: RelatedLink[] }) {
  return <>
    <header><p className="wiki-kicker">연구 도감 · 현재 확보된 공정연구</p><h1>{research.name}</h1><CheckedAt evidence={research.checkedAt} /></header>
    <div className="wiki-detail-grid">
      <WikiPanel><h2>연구 조건</h2><p>선행 연구 모두 충족 AND (요구 DOJpower 이상 OR 가치의 증표 착용)</p>
        <h3 className="mt-5">필수 선행 연구 · 모두 필요</h3>
        <EvidenceValue evidence={research.prerequisites} format={(ids) => ids.length ? <ul className="wiki-link-list">{ids.map((id) => { const link = related.find((link) => link.id === id); return <li key={id}>{link ? <Link href={link.href}>{link.title}</Link> : <span>참조 자료 누락</span>}</li>; })}</ul> : "없음 (원문 명시)"} />
        <h3 className="mt-5">추가 조건 · 둘 중 하나</h3><EvidenceValue evidence={research.access} format={(access) => `DOJpower ${access.powerOrEquipment.requiredDojpower} 이상 또는 가치의 증표 착용`} />
        <p className="wiki-muted">가치의 증표 착용은 선행 연구를 대체하지 않습니다. 방문자의 개인별 해금 여부는 판정하지 않습니다.</p>
      </WikiPanel>
      <WikiPanel><h2>소비 비용과 시간</h2><dl className="wiki-facts">
        <div><dt>토큰 비용</dt><dd><EvidenceValue evidence={research.tokens} format={formatTokens} /></dd></div>
        <div><dt>소비 재료</dt><dd><EvidenceValue evidence={research.materials} format={(materials) => materials.length ? <ul>{materials.map((material) => { const link = related.find((link) => link.id === material.itemId); return <li key={material.itemId}>{link ? <Link href={link.href}>{link.title} {material.quantity}개</Link> : "참조 자료 누락"}</li>; })}</ul> : "없음 (원문 명시)"} /></dd></div>
        <div><dt>소요 시간</dt><dd><EvidenceValue evidence={research.durationSeconds} format={formatDuration} /></dd></div>
      </dl><p className="wiki-muted">DOJpower 요구치와 연구 시 소비하는 비용은 별도입니다.</p></WikiPanel>
    </div>
    <WikiPanel><h2>효과·해금 대상</h2><EvidenceValue evidence={research.effects} format={(effects) => effects.length ? <ul className="wiki-prose">{effects.map((effect, index) => { const link = effect.targetId ? related.find((link) => link.id === effect.targetId) : undefined; return <li key={index}><p>{effect.text}</p>{link && <Link href={link.href}>{link.title} 상세 →</Link>}{effect.requiresSeparateRecipe && <p className="wiki-muted">실제 제작에는 별도 조합법 획득 필요. 연구 해금만으로 제작할 수 있는 것은 아닙니다.</p>}</li>; })}</ul> : "효과 없음"} /></WikiPanel>
    <RelatedLinks related={related} /><SourceReferences refs={research.refs} />
  </>;
}
