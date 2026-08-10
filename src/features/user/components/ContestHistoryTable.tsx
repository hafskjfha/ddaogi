import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ContestParticipation } from "@/features/user/model/types";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}

function formatSigned(value: number | null): string {
  if (value === null) return "-";
  return value > 0 ? `+${value}` : String(value);
}

/** Lists contest participation details in reverse chronological order. */
export function ContestHistoryTable({ history }: { history: readonly ContestParticipation[] }) {
  const contests = [...history].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>대회 기록</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="px-3 py-3 font-semibold">날짜</th>
              <th className="px-3 py-3 font-semibold">대회</th>
              <th className="px-3 py-3 text-right font-semibold">순위</th>
              <th className="px-3 py-3 text-right font-semibold">퍼포먼스</th>
              <th className="px-3 py-3 text-right font-semibold">레이팅</th>
              <th className="px-3 py-3 text-right font-semibold">변동</th>
              <th className="px-3 py-3 font-semibold">티어 변화</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((contest) => (
              <tr
                key={`${contest.date}-${contest.name}`}
                className="border-b border-slate-100 last:border-0 dark:border-slate-900"
              >
                <td className="whitespace-nowrap px-3 py-3">{formatDate(contest.date)}</td>
                <td className="px-3 py-3 font-medium">{contest.name}</td>
                <td className="px-3 py-3 text-right">{contest.rank}</td>
                <td className="px-3 py-3 text-right">{contest.performanceRating ?? "-"}</td>
                <td className="px-3 py-3 text-right">{contest.ratingAfter}</td>
                <td className="px-3 py-3 text-right">{formatSigned(contest.ratingDiff)}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  {contest.tierBefore === contest.tierAfter
                    ? "-"
                    : `${contest.tierBefore} → ${contest.tierAfter}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
