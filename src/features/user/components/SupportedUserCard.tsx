import { ArrowRight, UserRound } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { SupportedUserSummary } from "@/features/user/data/userCatalog";

interface SupportedUserCardProps {
  readonly user: SupportedUserSummary;
}

/** Summarizes the single available profile and links to its full analysis. */
export function SupportedUserCard({ user }: SupportedUserCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{user.handle}</h2>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{user.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            현재 이용 가능한 데모 프로필입니다. 현재는 jtw7913만 제공됩니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>현재 레이팅 {user.currentRating.toLocaleString("ko-KR")}</p>
          <p>만점 문제 {user.solvedCount.toLocaleString("ko-KR")}개</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300"
          href={user.href}
        >
          프로필 분석 보기 <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
