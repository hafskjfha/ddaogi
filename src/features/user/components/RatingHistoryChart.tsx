"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getRatingBand, RATING_BANDS } from "@/domain/rating";
import type { ContestParticipation } from "@/features/user/model/types";

type RatingSeries = "rating" | "performance";

interface ChartPoint {
  readonly index: number;
  readonly name: string;
  readonly date: string | null;
  readonly rank: number | null;
  readonly performanceRating: number | null;
  readonly ratingDiff: number | null;
  readonly ratingAfter: number;
  readonly seriesValue: number;
}

function formatKoreanDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function formatSigned(value: number | null): string {
  if (value === null) return "-";
  return value > 0 ? `+${value}` : String(value);
}

function pointSummary(point: ChartPoint): string {
  return [
    point.name,
    point.date === null ? "날짜 -" : formatKoreanDate(point.date),
    `레이팅 ${point.ratingAfter}`,
    `변동 ${formatSigned(point.ratingDiff)}`,
    `순위 ${point.rank === null ? "-" : `${point.rank}위`}`,
    `퍼포먼스 ${point.performanceRating ?? "-"}`,
  ].join(" · ");
}

function RatingTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload.length === 0) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div
      role="tooltip"
      className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-950"
    >
      <p className="font-bold">{point.name}</p>
      <p className="text-slate-600 dark:text-slate-400">
        {point.date === null ? "날짜 -" : formatKoreanDate(point.date)}
      </p>
      <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
        <dt>레이팅</dt>
        <dd className="text-right font-medium">{point.ratingAfter}</dd>
        <dt>변동</dt>
        <dd className="text-right font-medium">{formatSigned(point.ratingDiff)}</dd>
        <dt>순위</dt>
        <dd className="text-right font-medium">
          {point.rank === null ? "-" : `${point.rank}위`}
        </dd>
        <dt>퍼포먼스</dt>
        <dd className="text-right font-medium">{point.performanceRating ?? "-"}</dd>
      </dl>
    </div>
  );
}

function buildChartData(
  initialRating: number,
  history: readonly ContestParticipation[],
  series: RatingSeries,
): readonly ChartPoint[] {
  const contests = history.flatMap((contest) => {
    if (!contest.rated) return [];
    const seriesValue = series === "rating" ? contest.ratingAfter : contest.performanceRating;
    if (seriesValue === null) return [];

    return [
      {
        index: 0,
        name: contest.name,
        date: contest.date,
        rank: contest.rank,
        performanceRating: contest.performanceRating,
        ratingDiff: contest.ratingDiff,
        ratingAfter: contest.ratingAfter,
        seriesValue,
      },
    ];
  });
  const indexedContests = contests.map((contest, index) => ({ ...contest, index: index + 1 }));

  if (series === "performance") return indexedContests;
  return [
    {
      index: 0,
      name: "초기 레이팅",
      date: null,
      rank: null,
      performanceRating: null,
      ratingDiff: null,
      ratingAfter: initialRating,
      seriesValue: initialRating,
    },
    ...indexedContests,
  ];
}

function getChartDomain(
  initialRating: number,
  data: readonly ChartPoint[],
): readonly [number, number] {
  const values = data.length === 0 ? [initialRating] : data.map((point) => point.seriesValue);

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max(100, Math.ceil((maximum - minimum) * 0.15));
  return [Math.max(0, Math.floor((minimum - padding) / 100) * 100), Math.ceil((maximum + padding) / 100) * 100];
}

/** Renders initial/rated event series in a banded chart with an accessible point summary. */
export function RatingHistoryChart({
  initialRating,
  history,
  series,
}: {
  initialRating: number;
  history: readonly ContestParticipation[];
  series: RatingSeries;
}) {
  const data = buildChartData(initialRating, history, series);
  const domain = getChartDomain(initialRating, data);
  const lineValue = data.at(-1)?.seriesValue ?? initialRating;
  const lineColor = getRatingBand(lineValue).color;
  const title = series === "rating" ? "레이팅 변화" : "퍼포먼스 변화";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 min-w-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer={false}
              data={data}
              margin={{ top: 8, right: 12, bottom: 8, left: 4 }}
            >
              {RATING_BANDS.map((band) => {
                const lower = Math.max(domain[0], band.min);
                const upper = Math.min(domain[1], band.max ?? domain[1]);
                if (lower > upper) return null;
                return (
                  <ReferenceArea
                    key={band.title}
                    y1={lower}
                    y2={upper}
                    fill={band.color}
                    fillOpacity={0.08}
                    ifOverflow="hidden"
                  />
                );
              })}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="index"
                tickFormatter={(value: number) => (value === 0 ? "초기" : `${value}회`)}
              />
              <YAxis domain={[domain[0], domain[1]]} width={48} />
              <Tooltip content={RatingTooltip} />
              <Line
                type="monotone"
                dataKey="seriesValue"
                name={title}
                stroke={lineColor}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-4 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
          <summary className="cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300">
            차트 데이터 자세히 보기
          </summary>
          <ul aria-label={`${title} 상세`} className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
            {data.map((point) => (
              <li key={`${point.index}-${point.name}`}>{pointSummary(point)}</li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
