import { equipmentSlots, type WikiItem, type RelatedLink } from "../model/types";
import { SourceReferences } from "./SourceReferences";
import { CheckedAt, EvidenceValue, RelatedLinks, WikiPanel } from "./WikiPrimitives";
import { ItemArtwork } from "./ItemArtwork";

/** Presents recorded equipment fields and preserves minimal named entries as such. */
export function ItemDetails({ item, related }: { item: WikiItem; related: RelatedLink[] }) {
  return <>
    <header><p className="wiki-kicker">아이템 도감 · {item.kind === "equipment" ? "장비" : "이름만 확보"}</p><h1>{item.name}</h1><CheckedAt evidence={item.checkedAt} /></header>
    {item.kind === "minimal" ? <WikiPanel><p>이름만 확보한 항목입니다. 상세 정보 수집 중입니다.</p><p className="wiki-muted">구체적인 분류와 능력치, 획득 방법은 원문에 기재된 범위 밖입니다. 아래 연결과 출처를 참고해 주세요.</p></WikiPanel> : <div className="wiki-detail-grid">
      <WikiPanel><ItemArtwork name={item.name} src={"value" in item.image ? item.image.value : null} slot={"value" in item.slot ? item.slot.value : null} /></WikiPanel>
      <WikiPanel><h2>장비 정보</h2><dl className="wiki-facts">
        <div><dt>부위</dt><dd><EvidenceValue evidence={item.slot} format={(slot) => equipmentSlots[slot]} /></dd></div>
        <div><dt>기본 옵션</dt><dd><EvidenceValue evidence={item.options} format={(options) => <ul>{options.map((option) => <li key={option}>{option}</li>)}</ul>} /></dd></div>
        <div><dt>착용 요구치</dt><dd><EvidenceValue evidence={item.requiredDojpower} format={(power) => `DOJpower ${power} 이상`} /></dd></div>
        <div><dt>경매 가능 여부</dt><dd><EvidenceValue evidence={item.auctionable} format={(value) => value ? "가능" : "불가"} /></dd></div>
        {"value" in item.slot && item.slot.value === "background" && <div><dt>AI 여부</dt><dd><EvidenceValue evidence={item.aiGenerated} format={(value) => value ? "예 (true)" : "아니요 (false)"} /></dd></div>}
        <div><dt>스타포스 효과</dt><dd><EvidenceValue evidence={item.starforce} /></dd></div>
        <div><dt>획득 방법</dt><dd><EvidenceValue evidence={item.acquisition} /></dd></div>
      </dl></WikiPanel>
    </div>}
    <RelatedLinks related={related} /><SourceReferences refs={item.refs} />
  </>;
}
