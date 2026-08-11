import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScoreEstimateGrid } from "@/features/contest/components/ScoreEstimateGrid";
import type { ContestProblem } from "@/features/contest/model/types";
import type { ProblemTierGroup } from "@/domain/problemTier";

const TIER_BADGE_CLASSES: Record<ProblemTierGroup, string> = {
  Unrated: "bg-[#64748b] text-white",
  Bronze: "bg-[#ad5600] text-white",
  Silver: "bg-[#435f7a] text-white",
  Gold: "bg-[#ec9a00] text-slate-950",
  Platinum: "bg-[#27e2a4] text-slate-950",
  Diamond: "bg-[#00b4fc] text-slate-950",
  Ruby: "bg-[#ff0062] text-slate-950",
};

const DESKTOP_COLUMN_GRID =
  "md:grid-cols-[minmax(0,1.25fr)_minmax(0,.45fr)_minmax(0,.8fr)_minmax(0,1fr)]";

/** Compares problem difficulty, first full-score results, and score estimates. */
export function ContestProblemAnalysis({ problems }: { problems: readonly ContestProblem[] }) {
  return (
    <Card aria-labelledby="contest-problem-analysis-title">
      <CardHeader>
        <CardTitle id="contest-problem-analysis-title">문제 분석</CardTitle>
        <CardDescription>
          공식 레이팅이 아닌 mock scoreboard에서 계산한 추정치입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div role="table" aria-label="문제별 난이도와 점수 추정치" className="w-full">
          <div
            role="row"
            className={`sr-only md:not-sr-only md:grid ${DESKTOP_COLUMN_GRID} md:gap-4 md:px-4 md:pb-2 md:text-left md:text-xs md:font-semibold md:tracking-wide md:text-slate-500 md:dark:text-slate-400`}
          >
            <span role="columnheader">문제</span>
            <span role="columnheader">난이도</span>
            <span role="columnheader">첫 번째 만점</span>
            <span role="columnheader">점수별 예상 레이팅</span>
          </div>
          <div role="rowgroup" className="space-y-3 md:space-y-0">
            {problems.map((problem) => {
              const firstFull = problem.firstFull;

              return (
                <div
                  key={problem.index}
                  role="row"
                  aria-label={`${problem.index} ${problem.title}`}
                  className={`grid min-w-0 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 ${DESKTOP_COLUMN_GRID} md:items-center md:rounded-none md:border-x-0 md:border-b-0 md:border-t md:bg-transparent md:px-4 md:py-4 md:dark:bg-transparent`}
                >
                  <div role="cell" className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 md:hidden">
                      문제
                    </span>
                    <p className="min-w-0 break-words font-semibold text-slate-950 dark:text-slate-50">
                      <span className="me-2 text-slate-500 dark:text-slate-400">{problem.index}</span>
                      {problem.title}
                    </p>
                  </div>
                  <div role="cell" className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 md:hidden">
                      난이도
                    </span>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-black shadow-sm md:mt-0 ${TIER_BADGE_CLASSES[problem.tier.group]}`}
                    >
                      {problem.tier.shortLabel}
                    </span>
                  </div>
                  <div role="cell" className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 md:hidden">
                      첫 번째 만점
                    </span>
                    {firstFull ? (
                      <p className="mt-1 min-w-0 break-words text-sm font-medium md:mt-0">
                        <span>{firstFull.handle}</span>
                        <span className="mx-1 text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <time className="font-mono text-xs text-slate-600 dark:text-slate-300">
                          {firstFull.time}
                        </time>
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300 md:mt-0">
                        아직 없음
                      </p>
                    )}
                  </div>
                  <div role="cell" className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 md:hidden">
                      점수별 예상 레이팅
                    </span>
                    <div className="mt-1 md:mt-0">
                      <ScoreEstimateGrid estimates={problem.estimates} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
