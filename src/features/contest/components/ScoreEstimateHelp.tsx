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
            25·50·75·100점마다 그 점수 이상을 받은 rated 참가자의 대회 전 레이팅
            중앙값을 구해 10 단위로 반올림합니다.
          </p>
          <p>
            더 높은 점수 기준의 추정치가 감소하지 않도록 보정하며, 해당 참가자가 없으면
            -로 표시합니다.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
