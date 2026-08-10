import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ProblemSummary } from "@/features/user/model/types";

/** Renders a categorized, externally linked list of attempted problems. */
export function ProblemList({
  title,
  problems,
  showScore,
}: {
  title: string;
  problems: readonly ProblemSummary[];
  showScore: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {problems.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">문제가 없습니다.</p>
        ) : (
          <TooltipProvider delayDuration={150}>
            <ul className="space-y-3">
              {problems.map((problem) => (
                <li key={problem.id} className="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://doj.kr/ko/problems/${problem.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:text-slate-50 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
                      >
                        <span className="shrink-0 text-sm text-slate-600 dark:text-slate-400">
                          {problem.id} · {problem.tier.shortLabel}
                        </span>
                        <span className="truncate">{problem.title}</span>
                        <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{problem.title}</p>
                      {showScore ? (
                        <p>
                          {problem.bestScore} / {problem.maxScore}점
                        </p>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>
                  {showScore ? (
                    <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                      {problem.bestScore} / {problem.maxScore}점
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
