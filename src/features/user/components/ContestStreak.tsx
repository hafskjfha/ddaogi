import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContestStreakCells } from "@/features/user/components/ContestStreakCells";
import type { ContestStreakData } from "@/features/user/model/types";

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
        <ContestStreakCells entries={data.entries} />
      </CardContent>
    </Card>
  );
}
