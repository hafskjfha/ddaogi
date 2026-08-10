import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ContestStreakData } from "@/features/user/model/types";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

/** Shows participation streaks on a coordinate-compressed contest index. */
export function ContestStreak({ data }: { data: ContestStreakData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>대회 참가 스트릭</CardTitle>
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>현재 연속 {data.current}회</span>
          <span>최장 연속 {data.longest}회</span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={150}>
          <div role="group" className="flex flex-wrap gap-2" aria-label="대회별 참가 기록">
            {data.entries.map((entry) => (
              <Tooltip key={entry.index}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${entry.index}회차 ${entry.name}, ${entry.participated ? "참가" : "불참"}`}
                    className={`size-7 rounded-md border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 ${
                      entry.participated
                        ? "border-emerald-600 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-600"
                        : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{entry.name}</p>
                  <p>{formatDate(entry.date)}</p>
                  <p>{entry.participated ? "참가" : "불참"}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
