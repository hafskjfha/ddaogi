import type { Metadata } from "next";
import { loadDojstoryWiki } from "@/features/dojstory/data/loadDojstoryWiki";
import { WorkshopOverview } from "@/features/dojstory/components/WorkshopOverview";
export const metadata: Metadata = { title: "공방 · DOJstory", description: "머신, 내구도, 전력과 구리·철·프리즘 광산 안내" };
export default async function WorkshopPage() { return <WorkshopOverview workshop={(await loadDojstoryWiki()).workshop} />; }
