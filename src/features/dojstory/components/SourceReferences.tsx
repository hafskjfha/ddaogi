import Link from "next/link";
import { sources } from "../../../../data/dojstory/sources";
import type { SourceRef } from "../model/types";

/** Offers the original text and any external URLs recorded by its provider. */
export function SourceReferences({ refs }: { refs: SourceRef[] }) {
  const ids = [...new Set(refs.map((ref) => ref.sourceId))];
  return <section className="wiki-sources" aria-label="출처"><h2>출처와 원문</h2><p className="wiki-muted">제공 자료를 정리한 내용이며 독립적인 공식 검증을 의미하지 않습니다.</p><ul>{ids.map((id) => {
    const source = sources.find((entry) => entry.id === id);
    if (!source) return null;
    const sections = [...new Set(refs.filter((ref) => ref.sourceId === id).map((ref) => ref.section))];
    return <li key={id}><Link href={`/dojstory/sources/${id}`}>{source.title} 원문</Link><span className="wiki-muted"> · {sections.join(" / ")}</span><ul>{source.externalUrls.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{source.title} 외부 근거 {index + 1} ↗</a></li>)}</ul></li>;
  })}</ul></section>;
}
