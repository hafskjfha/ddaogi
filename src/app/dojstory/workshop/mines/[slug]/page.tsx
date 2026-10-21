import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { getWikiRelations } from "@/features/dojstory/data/buildWikiRelations";
import { MineDetails } from "@/features/dojstory/components/MineDetails";
import { RelatedLinks } from "@/features/dojstory/components/WikiPrimitives";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const mine = (await loadDojstoryWiki()).workshop.mines.find((mine) => mine.slug === slug);
  return { title: `${mine?.name ?? "광산 없음"} · DOJstory`, description: "광산의 관찰 수치와 레벨업 비용, 필요 경험치" };
}
export default async function MinePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadDojstoryWiki();
  const slug = (await params).slug;
  const mine = data.workshop.mines.find((mine) => mine.slug === slug);
  if (!mine) notFound();
  return <><MineDetails mine={mine} /><RelatedLinks related={getWikiRelations(data, mine.id)} /></>;
}
