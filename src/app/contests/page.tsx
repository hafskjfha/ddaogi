import type { Metadata } from "next";
import { ContestList } from "@/features/contest/components/ContestList";
import { CONTEST_CATALOG, paginateContests } from "@/features/contest/data/contestCatalog";

export const metadata: Metadata = { title: "대회 분석" };

/** Lists available contest analytics in fixed pages of twenty entries. */
export default async function ContestsPage(props: PageProps<"/contests">) {
  const { page: rawPage } = await props.searchParams;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const requestedPage = pageValue ? Number.parseInt(pageValue, 10) : 1;
  const page = paginateContests(CONTEST_CATALOG, requestedPage);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">대회 분석</h1>
        <p className="text-slate-600 dark:text-slate-400">분석할 DOJ 대회를 선택하세요.</p>
      </header>
      <ContestList page={page} />
    </div>
  );
}
