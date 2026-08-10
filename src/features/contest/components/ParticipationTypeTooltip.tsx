"use client";

import { CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ParticipationType } from "@/features/contest/model/types";

const PARTICIPATION_LABELS = {
  regular: "일반",
  window: "window",
} as const;

/** Explains regular and window contest participation from an accessible trigger. */
export function ParticipationTypeTooltip({
  participationType,
}: {
  participationType: ParticipationType;
}) {
  const label = PARTICIPATION_LABELS[participationType];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${label} 참가 방식 설명`}
            className="inline-flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            <Badge variant="muted">{label}</Badge>
            <CircleHelp
              aria-hidden="true"
              className="size-4 text-slate-500 dark:text-slate-400"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1.5 leading-relaxed" sideOffset={8}>
          <p>일반은 모든 참가자가 같은 시작 시각에 시작합니다.</p>
          <p>
            window는 대회가 열려 있는 동안 원하는 시각에 시작합니다. 시작한 뒤에는 대회 규정
            시간만큼 응시합니다.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
