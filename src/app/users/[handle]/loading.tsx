import { Card } from "@/components/ui/Card";

const skeletonBlock = "rounded-lg bg-slate-200 dark:bg-slate-800";

/** Shows the profile and analytics structure while user data is loading. */
export default function UserDashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">유저 대시보드를 불러오는 중입니다.</span>

      <Card
        aria-label="프로필 불러오는 중"
        className="overflow-hidden motion-safe:animate-pulse"
      >
        <div className="h-32 bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 px-5 pb-6 sm:px-8 lg:grid-cols-[auto_1fr]">
          <div className="-mt-12 size-24 rounded-full border-4 border-white bg-slate-300 dark:border-slate-950 dark:bg-slate-700" />
          <div className="space-y-4 pt-5">
            <div className={`${skeletonBlock} h-8 w-36`} />
            <div className={`${skeletonBlock} h-5 w-24`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={`${skeletonBlock} h-20`} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card
            key={index}
            aria-label="분석 카드 불러오는 중"
            className="space-y-5 p-6 motion-safe:animate-pulse"
          >
            <div className={`${skeletonBlock} h-6 w-32`} />
            <div className={`${skeletonBlock} h-40 w-full`} />
            <div className={`${skeletonBlock} h-4 w-3/4`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
