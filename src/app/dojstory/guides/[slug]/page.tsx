import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { getWikiRelations } from "@/features/dojstory/data/buildWikiRelations";
import { GuideContent } from "@/features/dojstory/components/GuideContent";
import { RelatedLinks } from "@/features/dojstory/components/WikiPrimitives";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const guide = (await loadDojstoryWiki()).guides.find((guide) => guide.slug === slug);
  return { title: `${guide?.title ?? "가이드 없음"} · DOJstory`, description: guide?.summary ?? "현재 수록되지 않은 가이드" };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadDojstoryWiki();
  const slug = (await params).slug;
  const guide = data.guides.find((guide) => guide.slug === slug);
  if (!guide) notFound();
  return <><GuideContent guide={guide} /><RelatedLinks related={getWikiRelations(data, guide.id)} /></>;
}
