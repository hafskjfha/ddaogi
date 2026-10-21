import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { findWikiItem } from "@/features/dojstory/data/queryWiki";
import { getWikiRelations } from "@/features/dojstory/data/buildWikiRelations";
import { ItemDetails } from "@/features/dojstory/components/ItemDetails";

export const dynamicParams = false;
/** Enumerates local entries so uncollected slugs return HTTP 404 before streaming. */
export async function generateStaticParams() { return (await loadDojstoryWiki()).items.map((item) => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = findWikiItem(await loadDojstoryWiki(), (await params).slug);
  return { title: `${item?.name ?? "아이템 없음"} · DOJstory`, description: item ? `${item.name}의 제공 자료와 관련 연구, 출처` : "현재 수록되지 않은 아이템" };
}
export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadDojstoryWiki();
  const item = findWikiItem(data, (await params).slug);
  if (!item) notFound();
  return <ItemDetails item={item} related={getWikiRelations(data, item.id)} />;
}
