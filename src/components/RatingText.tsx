import type { ReactNode } from "react";
import { getRatingBand, type RatingTitle } from "@/domain/rating";

/** Maps each rating title to its contrast-safe static theme classes. */
export const RATING_TEXT_CLASSES: Record<RatingTitle, string> = {
  NEWBIE: "text-slate-700 dark:text-slate-300",
  PUPIL: "text-green-700 dark:text-green-400",
  SPECIALIST: "text-teal-700 dark:text-teal-400",
  EXPERT: "text-blue-700 dark:text-blue-400",
  CANDIDATE_MASTER: "text-violet-700 dark:text-violet-400",
  MASTER: "text-orange-700 dark:text-orange-400",
  INTERNATIONAL_MASTER: "text-red-700 dark:text-red-400",
  GRANDMASTER: "text-red-800 dark:text-red-300",
};

/** Renders children with the color associated with a numeric rating's band. */
export function RatingText({ rating, children }: { rating: number; children: ReactNode }) {
  return <span className={RATING_TEXT_CLASSES[getRatingBand(rating).title]}>{children}</span>;
}

/** Renders children with the color associated with a rating title. */
export function RatingTitleText({ title, children }: { title: RatingTitle; children: ReactNode }) {
  return <span className={RATING_TEXT_CLASSES[title]}>{children}</span>;
}

/** Renders a signed rating change with positive, negative, or unavailable semantics. */
export function RatingDelta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-slate-500 dark:text-slate-400">-</span>;
  }

  if (value > 0) {
    return <span className="text-emerald-700 dark:text-emerald-400">+{value}</span>;
  }

  if (value < 0) {
    return <span className="text-red-700 dark:text-red-400">{value}</span>;
  }

  return <span className="text-slate-700 dark:text-slate-300">0</span>;
}
