import { Code2, Languages, Trophy, Zap, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { LanguageDistribution } from "@/features/user/components/LanguageDistribution";
import type { UserDashboardData } from "@/features/user/model/types";

interface Metric {
  readonly label: string;
  readonly value: string;
  readonly icon: LucideIcon;
}

/** Presents language usage and concise submission and contest statistics. */
export function MoreOverview({ dashboard }: { dashboard: UserDashboardData }) {
  const metrics: readonly Metric[] = [
    {
      label: "전체 제출",
      value: `${dashboard.totalSubmissions.toLocaleString("ko-KR")}회`,
      icon: Code2,
    },
    {
      label: "사용 언어",
      value: `${dashboard.languages.length.toLocaleString("ko-KR")}개`,
      icon: Languages,
    },
    {
      label: "대회 1등",
      value: `${dashboard.profile.podiumCount.toLocaleString("ko-KR")}회`,
      icon: Trophy,
    },
    {
      label: "퍼솔",
      value: `${dashboard.profile.firstFullCount.toLocaleString("ko-KR")}회`,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <dl role="list" aria-label="기타 통계" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} role="listitem">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</dt>
                  <dd className="text-2xl font-bold tracking-tight">{metric.value}</dd>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </dl>
      <LanguageDistribution languages={dashboard.languages} />
    </div>
  );
}
