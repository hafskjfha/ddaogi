import { ArrowRight, Bird, CircleAlert, Trophy, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/Card";

const USER_DEMO_HREF = "/users/jtw7913";
const CONTEST_DEMO_HREF = "/contests/doj-beginner-contest-4";
const USER_INDEX_HREF = "/users";
const CONTEST_INDEX_HREF = "/contests";

/** Introduces Ddaogi and routes visitors to the available analytics demos. */
export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <Bird aria-hidden="true" className="size-4" />
            DOJ 서드파티 분석 서비스
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DOJ를 더 깊이 읽는 따오기</h1>
            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              유저의 성장 과정과 대회의 결과를 한눈에 살펴보세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={USER_DEMO_HREF}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
            >
              유저 분석 데모 보기 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href={CONTEST_DEMO_HREF}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
            >
              대회 분석 데모 보기 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <CardHeader className="flex-row items-start gap-3">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold leading-none tracking-tight">이용 전 확인해 주세요</h2>
              <CardDescription className="text-amber-900 dark:text-amber-200">
                따오기는 DOJ에서 운영하는 공식 사이트가 아닌 유저가 만든 자작 사이트입니다.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-amber-900 dark:text-amber-200">
            데이터 기준은 2026.08.11 오전 2시이며 실시간 데이터가 아닙니다.
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="분석 기능">
        <Link
          href={USER_INDEX_HREF}
          aria-label="유저 분석 페이지로 이동"
          className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
        >
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-800">
            <CardHeader>
              <UserRoundSearch aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold leading-none tracking-tight">유저 분석</h2>
              <CardDescription>레이팅, 문제 풀이, 대회 기록을 입체적으로 확인합니다.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link
          href={CONTEST_INDEX_HREF}
          aria-label="대회 분석 페이지로 이동"
          className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
        >
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-800">
            <CardHeader>
              <Trophy aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold leading-none tracking-tight">대회 분석</h2>
              <CardDescription>참가자 레이팅 분포와 문제별 결과를 비교합니다.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </div>
  );
}
