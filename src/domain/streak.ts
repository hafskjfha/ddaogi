export interface StreakSummary {
  readonly current: number;
  readonly longest: number;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns the trailing and longest consecutive runs of true values. */
export function calculateSequenceStreak(values: readonly boolean[]): StreakSummary {
  let current = 0;
  let longest = 0;

  for (const value of values) {
    if (!value) {
      current = 0;
      continue;
    }

    current += 1;
    longest = Math.max(longest, current);
  }

  return { current, longest };
}

/**
 * Returns the longest active calendar-day run and the run ending exactly on asOf.
 * Dates are compared as UTC calendar days; invalid dates are ignored and duplicate dates count once.
 */
export function calculateDailyStreak(activeDates: readonly string[], asOf: string): StreakSummary {
  const activeDayIndices = new Set(
    activeDates.map(toUtcDayIndex).filter((dayIndex): dayIndex is number => dayIndex !== null),
  );
  const sortedDayIndices = [...activeDayIndices].sort((left, right) => left - right);
  let longest = 0;
  let runLength = 0;
  let previousDayIndex: number | null = null;

  for (const dayIndex of sortedDayIndices) {
    runLength = previousDayIndex !== null && dayIndex === previousDayIndex + 1 ? runLength + 1 : 1;
    longest = Math.max(longest, runLength);
    previousDayIndex = dayIndex;
  }

  const asOfDayIndex = toUtcDayIndex(asOf);
  if (asOfDayIndex === null || !activeDayIndices.has(asOfDayIndex)) {
    return { current: 0, longest };
  }

  let current = 0;
  while (activeDayIndices.has(asOfDayIndex - current)) {
    current += 1;
  }

  return { current, longest };
}

function toUtcDayIndex(value: string): number | null {
  if (!ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return Math.floor(date.getTime() / 86_400_000);
}
