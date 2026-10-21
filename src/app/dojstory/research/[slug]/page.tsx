import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { findWikiResearch } from "@/features/dojstory/data/queryWiki";
import { getWikiRelations } from "@/features/dojstory/data/buildWikiRelations";
import { ResearchDetails } from "@/features/dojstory/components/ResearchDetails";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = findWikiResearch(await loadDojstoryWiki(), (await params).slug);
  return { title: `${entry?.name ?? "연구 없음"} · DOJstory`, description: entry ? `${entry.name}의 필수 선행 연구, 요구 DOJpower, 비용과 효과` : "현재 수록되지 않은 연구" };
}
export default async function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadDojstoryWiki();
  const entry = findWikiResearch(data, (await params).slug);
  if (!entry) notFound();
  return <ResearchDetails research={entry} related={getWikiRelations(data, entry.id)} />;
}
