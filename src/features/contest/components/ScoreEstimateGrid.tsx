import { RatingText } from "@/components/RatingText";
import type { ScoreEstimates } from "@/features/contest/model/types";

/** Displays estimated pre-contest ratings for observed score thresholds. */
export function ScoreEstimateGrid({ estimates }: { estimates: ScoreEstimates }) {
  return (
    <dl
      className="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-1"
      aria-label="점수별 예상 레이팅"
    >
      {estimates.map((estimate) => (
        <div
          key={estimate.score}
          className="min-w-0 rounded-lg bg-slate-100 px-1.5 py-2 text-center dark:bg-slate-900"
        >
          <dt className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            {estimate.score}점
          </dt>
          <dd className="font-mono text-xs font-bold tabular-nums">
            {estimate.rating === null ? (
              <span className="text-slate-500 dark:text-slate-400">-</span>
            ) : (
              <RatingText rating={estimate.rating}>
                {estimate.rating.toLocaleString("ko-KR")}
              </RatingText>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
