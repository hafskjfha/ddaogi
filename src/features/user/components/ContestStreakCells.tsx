"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ContestCalendarEntry } from "@/features/user/model/types";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

/** Coordinates contest cell tooltips so only the latest cell remains active. */
export function ContestStreakCells({ entries }: { entries: readonly ContestCalendarEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <TooltipProvider delayDuration={150}>
      <div role="group" className="flex flex-wrap gap-2" aria-label="대회별 참가 기록">
        {entries.map((entry) => (
          <Tooltip
            key={entry.index}
            open={openIndex === entry.index}
            onOpenChange={(open) => {
              if (open) {
                setOpenIndex(entry.index);
                return;
              }

              setOpenIndex((current) => (current === entry.index ? null : current));
            }}
          >
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
  );
}
