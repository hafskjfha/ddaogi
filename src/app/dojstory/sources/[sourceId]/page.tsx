import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadWikiSource } from "@/features/dojstory/data/loadWikiSource";
import { CheckedAt } from "@/features/dojstory/components/WikiPrimitives";
import { sources } from "../../../../../data/dojstory/sources";

export const dynamicParams = false;
export function generateStaticParams() { return sources.map((source) => ({ sourceId: source.id })); }

export async function generateMetadata({ params }: { params: Promise<{ sourceId: string }> }): Promise<Metadata> {
  const source = await loadWikiSource((await params).sourceId);
  return { title: source ? `${source.title} 원문 · DOJstory` : "출처 없음 · DOJstory", description: "제공받은 자료의 원문과 확인 시점" };
}

/** HTML tables and SVG in originals stay escaped text, never executable markup. */
export default async function SourcePage({ params }: { params: Promise<{ sourceId: string }> }) {
  const source = await loadWikiSource((await params).sourceId);
  if (!source) notFound();
  return <><header><h1>{source.title} 원문</h1><CheckedAt evidence={source.checkedAt} /><p className="wiki-muted">사용자가 제공한 수집 자료입니다. 같은 항목의 정정·보완은 보완 자료를 우선합니다.</p></header><ul>{source.externalUrls.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{source.title} 외부 근거 {index + 1} ↗</a></li>)}</ul><pre className="wiki-original">{source.text}</pre></>;
}
