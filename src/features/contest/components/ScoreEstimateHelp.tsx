"use client";

import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

/** Explains the scoreboard-derived estimate algorithm from a compact accessible trigger. */
export function ScoreEstimateHelp() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="예상 레이팅 산출 방식"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            <CircleHelp aria-hidden="true" className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          collisionPadding={16}
          className="max-w-[min(22rem,calc(100vw-2rem))] space-y-1.5 leading-relaxed"
          sideOffset={8}
        >
          <p>
            참가자의 0점 초과·100점 미만 부분점수 분포에서 사분위 관측값을 고르고,
            100점은 항상 포함합니다.
          </p>
          <p>
            각 기준에서 rated 참가자의 대회 전 레이팅과 달성·미달을 성공 확률 곡선에
            맞춥니다. 달성자나 미달자가 없으면 산정할 수 없어 -로 표시합니다.
          </p>
          <p className="text-xs text-slate-200 dark:text-slate-700">
            성공 확률은 1 / (1 + 6^((예상 레이팅 - 참가자 레이팅) / 400))로 둡니다.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
