import { CalendarDays, Clock3, Gauge, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ParticipationTypeTooltip } from "@/features/contest/components/ParticipationTypeTooltip";
import type { ContestSummary } from "@/features/contest/model/types";

/** Presents a contest's identity, schedule, administration, and participation format. */
export function ContestHero({ contest }: { contest: ContestSummary }) {
  return (
    <Card className="overflow-hidden" aria-labelledby="contest-title">
      <div
        aria-hidden="true"
        className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 dark:from-blue-500 dark:via-cyan-400 dark:to-emerald-400"
      />
      <div className="space-y-6 p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">대회 분석</Badge>
              <ParticipationTypeTooltip participationType={contest.participationType} />
            </div>
            <h1 id="contest-title" className="text-3xl font-black tracking-tight sm:text-4xl">
              {contest.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              문제 정렬 · <span className="font-semibold text-slate-950 dark:text-slate-50">{contest.problemOrder}</span>
            </p>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-3 text-sm sm:min-w-72">
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-slate-600 dark:text-slate-400">Director</dt>
              <dd className="mt-1 font-semibold">{contest.director}</dd>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-slate-600 dark:text-slate-400">Setter</dt>
              <dd className="mt-1 font-semibold">{contest.setter}</dd>
            </div>
          </dl>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex min-w-0 gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <CalendarDays
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
            />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                일정
              </dt>
              <dd className="mt-1 space-y-0.5 text-sm font-medium">
                <time dateTime={contest.startAt} className="block">
                  {contest.startLabel}
                </time>
                <span aria-hidden="true" className="block text-slate-400 dark:text-slate-500">
                  ↓
                </span>
                <time dateTime={contest.endAt} className="block">
                  {contest.endLabel}
                </time>
              </dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <Clock3
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
            />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                응시 시간
              </dt>
              <dd className="mt-1 font-bold">{contest.durationMinutes}분</dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <Gauge
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
            />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rated 범위
              </dt>
              <dd className="mt-1 font-bold">~{contest.ratedUpperBound} rated</dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <Users
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
            />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                운영진
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {contest.director} · {contest.setter}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </Card>
  );
}
