import { Card } from "@/components/ui/Card";
import type { UserProfile } from "@/features/user/model/types";

/** Presents the user identity and headline analytics. */
export function UserProfileHero({ profile }: { profile: UserProfile }) {
  const initials = profile.handle.slice(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div
        role="img"
        aria-label={`${profile.handle} 장착 플랜카드 대체 표시`}
        className="relative h-32"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-orange-300 via-amber-100 to-teal-200 dark:from-orange-950 dark:via-slate-900 dark:to-teal-950"
        />
      </div>
      <div className="grid gap-6 px-5 pb-6 sm:px-8 lg:grid-cols-[auto_1fr]">
        <div
          aria-label={`${profile.handle} 프로필 이미지 대체 표시`}
          className="-mt-12 grid size-24 place-items-center rounded-3xl border-4 border-white bg-slate-900 text-2xl font-black text-white dark:border-slate-950"
        >
          {initials}
        </div>
        <div className="pt-1 lg:pt-5">
          <h1 className="text-3xl font-black tracking-tight">{profile.handle}</h1>
          <p className="font-bold" style={{ color: profile.titleColor }}>
            {profile.title}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            {profile.ratingRank}등 · top {profile.ratingPercentile}%
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-sm text-slate-600 dark:text-slate-400">현재 레이팅</dt>
              <dd className="font-bold" style={{ color: profile.titleColor }}>
                현재 {profile.currentRating.toLocaleString("ko-KR")}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-sm text-slate-600 dark:text-slate-400">최고 레이팅</dt>
              <dd className="font-bold" style={{ color: profile.titleColor }}>
                최고 {profile.maxRating.toLocaleString("ko-KR")}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-sm text-slate-600 dark:text-slate-400">레이팅 랭킹</dt>
              <dd className="font-bold">{profile.ratingRank}등</dd>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <dt className="text-sm text-slate-600 dark:text-slate-400">만점 문제 수</dt>
              <dd className="font-bold">{profile.solvedCount}문제</dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}
