import { RatingText } from "@/components/RatingText";
import type { ScoreEstimates } from "@/features/contest/model/types";

const ESTIMATE_CELLS = [
  ["25%", "score25"],
  ["50%", "score50"],
  ["75%", "score75"],
  ["100%", "score100"],
] as const satisfies readonly (readonly [string, keyof ScoreEstimates])[];

/** Displays estimated pre-contest ratings for the four score thresholds. */
export function ScoreEstimateGrid({ estimates }: { estimates: ScoreEstimates }) {
  return (
    <dl className="grid grid-cols-4 gap-1" aria-label="점수별 예상 레이팅">
      {ESTIMATE_CELLS.map(([label, key]) => {
        const value = estimates[key];

        return (
          <div
            key={label}
            className="min-w-0 rounded-lg bg-slate-100 px-1.5 py-2 text-center dark:bg-slate-900"
          >
            <dt className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="font-mono text-xs font-bold tabular-nums">
              {value === null ? (
                <span className="text-slate-500 dark:text-slate-400">-</span>
              ) : (
                <RatingText rating={value}>{value.toLocaleString("ko-KR")}</RatingText>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
