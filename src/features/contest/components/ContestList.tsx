import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { ContestPage } from "../data/contestCatalog";

export interface ContestListProps {
  readonly page: ContestPage;
}

/** Renders a page of available contest analytics entries and page navigation. */
export function ContestList({ page }: ContestListProps) {
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4" aria-label="대회 목록">
        {page.items.map((contest) => (
          <li key={contest.slug}>
            <Card className="h-full">
              <CardHeader>
                <h2 className="text-lg font-semibold leading-none tracking-tight">{contest.title}</h2>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3 sm:gap-x-6 dark:text-slate-400">
                  <div>
                    <dt className="flex items-center gap-1.5 font-medium text-slate-950 dark:text-slate-50">
                      <CalendarDays aria-hidden="true" className="size-4" />
                      <span>개최일</span>
                    </dt>
                    <dd>{contest.dateLabel}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 font-medium text-slate-950 dark:text-slate-50">
                      <Users aria-hidden="true" className="size-4" />
                      <span>참가 유형</span>
                    </dt>
                    <dd>{contest.participationLabel}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 font-medium text-slate-950 dark:text-slate-50">
                      <Clock3 aria-hidden="true" className="size-4" />
                      <span>대회 시간</span>
                    </dt>
                    <dd>{contest.durationLabel}</dd>
                  </div>
                </dl>
                <Link
                  href={contest.href}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
                >
                  상세 분석 보기
                </Link>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <nav
        aria-label="대회 목록 페이지"
        className="grid w-full grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-center"
      >
        <p className="col-span-2 text-center text-sm text-slate-600 sm:order-2 dark:text-slate-400">
          {page.currentPage} / {page.totalPages} 페이지
        </p>
        {page.hasPrevious ? (
          <Link
            href={`/contests?page=${page.currentPage - 1}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 sm:order-1 sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            이전 페이지
          </Link>
        ) : (
          <Button className="w-full sm:order-1 sm:w-auto" variant="outline" disabled>
            <ChevronLeft aria-hidden="true" className="size-4" />
            이전 페이지
          </Button>
        )}
        {page.hasNext ? (
          <Link
            href={`/contests?page=${page.currentPage + 1}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 sm:order-3 sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            다음 페이지
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <Button className="w-full sm:order-3 sm:w-auto" variant="outline" disabled>
            다음 페이지
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        )}
      </nav>
    </div>
  );
}
