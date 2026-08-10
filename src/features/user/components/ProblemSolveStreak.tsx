import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { DailyActivityData, DailyActivityPoint } from "@/features/user/model/types";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function heatmapClass(count: number): string {
  if (count === 0) return "border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900";
  if (count === 1) return "border-emerald-200 bg-emerald-200 dark:border-emerald-900 dark:bg-emerald-900";
  if (count === 2) return "border-emerald-300 bg-emerald-300 dark:border-emerald-800 dark:bg-emerald-800";
  if (count === 3) return "border-emerald-400 bg-emerald-400 dark:border-emerald-700 dark:bg-emerald-700";
  if (count === 4) return "border-emerald-500 bg-emerald-500 dark:border-emerald-600 dark:bg-emerald-600";
  return "border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500";
}

function activityLabel(activity: DailyActivityPoint): string {
  return `${activity.date}: ${activity.count}개 해결`;
}

/** Shows first-full solve activity in an accessible seven-row weekly heatmap. */
export function ProblemSolveStreak({ data }: { data: DailyActivityData }) {
  const firstFullIndex = data.days.findIndex((activity) => activity.count > 0);
  const heatmapDays = firstFullIndex === -1 ? [] : data.days.slice(firstFullIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>문제 풀이 스트릭</CardTitle>
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>현재 연속 {data.current}일</span>
          <span>최장 연속 {data.longest}일</span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={150}>
          <div
            role="group"
            aria-label="일별 만점 문제 해결 기록"
            className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto"
          >
            {heatmapDays.map((activity) => (
              <Tooltip key={activity.date}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={activityLabel(activity)}
                    className={`size-5 rounded-sm border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950 ${heatmapClass(activity.count)}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{formatDate(activity.date)}</p>
                  <p>{activity.count}개 해결</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
