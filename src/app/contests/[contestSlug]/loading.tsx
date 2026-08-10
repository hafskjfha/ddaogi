import { Card } from "@/components/ui/Card";

const skeletonBlock = "rounded-lg bg-slate-200 dark:bg-slate-800";

/** Shows the contest overview and nine-row analysis structure while data is loading. */
export default function ContestDashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">대회 대시보드를 불러오는 중입니다.</span>

      <Card
        aria-label="대회 제목 불러오는 중"
        className="space-y-5 overflow-hidden p-6 motion-safe:animate-pulse sm:p-8"
      >
        <div aria-hidden="true" className="h-2 bg-slate-200 dark:bg-slate-800" />
        <div
          data-testid="contest-title-skeleton"
          className={`${skeletonBlock} h-10 w-full max-w-md`}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={`${skeletonBlock} h-20`} />
          ))}
        </div>
      </Card>

      <Card
        aria-label="Rated 참가자 분포 불러오는 중"
        className="space-y-5 p-6 motion-safe:animate-pulse"
      >
        <div className={`${skeletonBlock} h-7 w-48`} />
        <div className={`${skeletonBlock} h-10 w-full`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`${skeletonBlock} h-16`} />
          ))}
        </div>
      </Card>

      <Card aria-label="문제 분석 불러오는 중" className="p-6">
        <div className="mb-5 space-y-2 motion-safe:animate-pulse">
          <div className={`${skeletonBlock} h-7 w-32`} />
          <div className={`${skeletonBlock} h-4 w-full max-w-md`} />
        </div>
        <div className="space-y-3 md:space-y-0">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              role="region"
              aria-label="문제 행 불러오는 중"
              className="grid min-w-0 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 motion-safe:animate-pulse dark:border-slate-800 dark:bg-slate-900/70 md:grid-cols-[minmax(0,1.25fr)_minmax(0,.45fr)_minmax(0,.8fr)_minmax(0,1fr)] md:items-center md:rounded-none md:border-x-0 md:border-b-0 md:bg-transparent md:dark:bg-transparent"
            >
              <div className={`${skeletonBlock} h-5 w-3/4`} />
              <div className={`${skeletonBlock} h-7 w-12 rounded-full`} />
              <div className={`${skeletonBlock} h-5 w-2/3`} />
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 4 }, (_, estimateIndex) => (
                  <div key={estimateIndex} className={`${skeletonBlock} h-12`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
