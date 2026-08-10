"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DistributionItem } from "@/features/user/model/types";

const GROUP_ORDER = ["Unrated", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"] as const;
const GROUP_INDEX = new Map<string, number>(
  GROUP_ORDER.map((group, index): readonly [string, number] => [group, index]),
);
const DETAIL_ORDER: readonly (readonly [string, number])[] = [
  ["Unrated", 0],
  ...GROUP_ORDER.slice(1).flatMap((group, groupIndex) =>
    ["V", "IV", "III", "II", "I"].map(
      (level, levelIndex): readonly [string, number] => [
        `${group} ${level}`,
        groupIndex * 5 + levelIndex + 1,
      ],
    ),
  ),
];
const DETAIL_INDEX = new Map<string, number>(DETAIL_ORDER);

function orderItems(items: readonly DistributionItem[], detail: boolean): readonly DistributionItem[] {
  const indexes = detail ? DETAIL_INDEX : GROUP_INDEX;
  return [...items].sort((left, right) => {
    const leftIndex = indexes.get(left.label) ?? Number.POSITIVE_INFINITY;
    const rightIndex = indexes.get(right.label) ?? Number.POSITIVE_INFINITY;
    return leftIndex - rightIndex || left.label.localeCompare(right.label);
  });
}

function formatPercentage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

/** Renders a toggleable summary or detail donut of solved problem tiers. */
export function DifficultyDistribution({
  groups,
  details,
}: {
  groups: readonly DistributionItem[];
  details: readonly DistributionItem[];
}) {
  const [detail, setDetail] = useState(false);
  const items = useMemo(() => orderItems(detail ? details : groups, detail), [detail, details, groups]);
  const legendLabel = detail ? "난이도 상세 분포" : "난이도 그룹 분포";

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>난이도 분포</CardTitle>
        <Button
          aria-pressed={detail}
          variant="outline"
          size="sm"
          onClick={() => setDetail((current) => !current)}
        >
          {detail ? "요약 보기" : "자세히 보기"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0" aria-hidden="true">
            <PieChart width={220} height={220}>
              <Pie data={items} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={54} outerRadius={90} isAnimationActive={false}>
                {items.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          <ul aria-label={legendLabel} className="w-full space-y-2 text-sm">
            {items.map((item) => {
              const fullySolved = item.totalAvailable !== null && item.count === item.totalAvailable;
              return (
                <li key={item.key} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.label}</span>
                    {fullySolved ? (
                      <CircleCheck
                        aria-label={`${item.label} 전체 해결`}
                        className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                    ) : null}
                  </span>
                  <span className="shrink-0 text-right text-slate-600 dark:text-slate-400">
                    {item.count}개 ({formatPercentage(item.percentage)}%)
                    <span className="ml-2 text-xs">
                      {item.totalAvailable === null ? "집계 미제공" : `${item.totalAvailable}개 중`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
