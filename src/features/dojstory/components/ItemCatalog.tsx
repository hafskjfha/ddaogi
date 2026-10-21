import Link from "next/link";
import { equipmentSlots, type WikiItem } from "../model/types";
import { ItemArtwork } from "./ItemArtwork";

/** Includes named minimal entries alongside equipment until a slot filter is used. */
export function ItemCatalog({ items }: { items: WikiItem[] }) {
  if (!items.length) return <p>검색 조건에 맞는 아이템이 없습니다.</p>;
  return <ul className="wiki-result-grid">{items.map((item) => <li key={item.id}><Link className="wiki-result" href={`/dojstory/items/${item.slug}`} aria-label={`${item.name} 상세 보기`}>
    <ItemArtwork name={item.name} src={"value" in item.image ? item.image.value : null} slot={"value" in item.slot ? item.slot.value : null} />
    <span className="wiki-kicker">{item.kind === "equipment" && "value" in item.slot ? equipmentSlots[item.slot.value] : "이름만 확보"}</span><strong>{item.name}</strong>
    {item.kind === "minimal" && <span className="wiki-muted">상세 정보 수집 중</span>}
  </Link></li>)}</ul>;
}
