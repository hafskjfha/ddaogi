import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getRatingBand } from "@/domain/rating";
import type { RatingDistribution } from "@/features/contest/model/types";

type DistributionKey = "min" | "q1" | "median" | "q3" | "max";

const DISTRIBUTION_LABELS: readonly {
  readonly key: DistributionKey;
  readonly label: string;
}[] = [
  { key: "min", label: "최솟값" },
  { key: "q1", label: "Q1" },
  { key: "median", label: "중앙값" },
  { key: "q3", label: "Q3" },
  { key: "max", label: "최댓값" },
];

/** Shows the rated participants' five-number rating distribution. */
export function RatingQuartiles({ distribution }: { distribution: RatingDistribution }) {
  const points = DISTRIBUTION_LABELS.map(({ key, label }) => ({
    key,
    label,
    value: distribution[key],
  }));

  return (
    <Card aria-labelledby="rating-quartiles-title">
      <CardHeader className="sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle id="rating-quartiles-title">Rated 참가자 분포</CardTitle>
          <CardDescription className="mt-1">대회 시작 전 레이팅의 5수 요약</CardDescription>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {distribution.count.toLocaleString("ko-KR")}명
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          aria-hidden="true"
          className="relative h-10 overflow-hidden rounded-xl bg-slate-100 px-1 dark:bg-slate-900"
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-300 dark:bg-slate-700" />
          {points.map((point) => {
            const position = markerPosition(point.value, distribution.min, distribution.max);
            const edgeClass =
              position === 0
                ? "translate-x-0"
                : position === 100
                  ? "-translate-x-full"
                  : "-translate-x-1/2";

            return (
              <span
                key={point.key}
                data-testid={`rating-marker-${point.key}`}
                className={`absolute top-1/2 h-7 w-2 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm dark:bg-slate-950 ${edgeClass}`}
                style={{
                  left: `${position}%`,
                  borderColor: getRatingBand(point.value).color,
                }}
              />
            );
          })}
        </div>

        <ol
          aria-label="Rated 참가자 레이팅 5수 요약"
          className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5"
        >
          {points.map((point) => (
            <li
              key={point.key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <span
                className="block border-s-4 ps-2 font-semibold text-slate-950 dark:text-slate-50"
                style={{ borderColor: getRatingBand(point.value).color }}
              >
                {point.label} {point.value.toLocaleString("ko-KR")}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function markerPosition(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
