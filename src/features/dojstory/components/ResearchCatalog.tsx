import Link from "next/link";
import type { WikiResearch } from "../model/types";
import { EvidenceValue, formatDuration, formatTokens } from "./WikiPrimitives";

export function ResearchCatalog({ research }: { research: WikiResearch[] }) {
  if (!research.length) return <p>검색 조건에 맞는 연구가 없습니다.</p>;
  return <ul className="wiki-result-grid">{research.map((entry) => <li key={entry.id}><Link href={`/dojstory/research/${entry.slug}`} className="wiki-result"><span className="wiki-kicker">공정연구</span><strong>{entry.name}</strong><span className="wiki-muted"><EvidenceValue evidence={entry.tokens} format={formatTokens} /> · <EvidenceValue evidence={entry.durationSeconds} format={formatDuration} /></span><span className="wiki-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>;
}
