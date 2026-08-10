export type RatingTitle =
  | "NEWBIE"
  | "PUPIL"
  | "SPECIALIST"
  | "EXPERT"
  | "CANDIDATE_MASTER"
  | "MASTER"
  | "INTERNATIONAL_MASTER"
  | "GRANDMASTER";

export interface RatingBand {
  readonly min: number;
  readonly max: number | null;
  readonly title: RatingTitle;
  readonly color: `rgb(${number}, ${number}, ${number})`;
}

export const RATING_BANDS: readonly RatingBand[] = [
  { min: 0, max: 1199, title: "NEWBIE", color: "rgb(100, 116, 139)" },
  { min: 1200, max: 1399, title: "PUPIL", color: "rgb(34, 197, 94)" },
  { min: 1400, max: 1599, title: "SPECIALIST", color: "rgb(20, 184, 166)" },
  { min: 1600, max: 1799, title: "EXPERT", color: "rgb(59, 130, 246)" },
  { min: 1800, max: 1999, title: "CANDIDATE_MASTER", color: "rgb(139, 92, 246)" },
  { min: 2000, max: 2199, title: "MASTER", color: "rgb(249, 115, 22)" },
  { min: 2200, max: 2399, title: "INTERNATIONAL_MASTER", color: "rgb(239, 68, 68)" },
  { min: 2400, max: null, title: "GRANDMASTER", color: "rgb(220, 38, 38)" },
];

/** Returns the inclusive rating band after clamping negative ratings to zero. */
export function getRatingBand(rating: number): RatingBand {
  const normalizedRating = Math.max(0, rating);

  return (
    RATING_BANDS.find(
      (band) => normalizedRating >= band.min && (band.max === null || normalizedRating <= band.max),
    ) ?? RATING_BANDS[0]
  );
}
