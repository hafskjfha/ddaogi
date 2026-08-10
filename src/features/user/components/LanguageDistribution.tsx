"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DistributionItem } from "@/features/user/model/types";

const LANGUAGE_LABELS: Readonly<Record<string, string>> = {
  pypy3: "PyPy 3",
  python3: "Python 3",
  cpp17: "C++17",
  cpp20: "C++20",
  "custom-json": "Custom JSON",
};

function formatPercentage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function orderLanguages(items: readonly DistributionItem[]): readonly DistributionItem[] {
  return [...items].sort(
    (left, right) =>
      right.count - left.count ||
      (LANGUAGE_LABELS[left.key] ?? left.label).localeCompare(
        LANGUAGE_LABELS[right.key] ?? right.label,
      ),
  );
}

/** Renders a submission-language donut with a count and percentage legend. */
export function LanguageDistribution({ languages }: { languages: readonly DistributionItem[] }) {
  const items = orderLanguages(languages).map((item) => ({
    ...item,
    label: LANGUAGE_LABELS[item.key] ?? item.label,
    shortLabel: LANGUAGE_LABELS[item.key] ?? item.shortLabel,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용 언어 분포</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p
            role="status"
            className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400"
          >
            언어별 제출 집계 미제공
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0" aria-hidden="true">
              <PieChart width={220} height={220}>
                <Pie
                  data={items}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={90}
                  isAnimationActive={false}
                >
                  {items.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <ul aria-label="언어별 제출 분포" className="w-full space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 text-slate-600 dark:text-slate-400">
                    {item.count}회 ({formatPercentage(item.percentage)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
