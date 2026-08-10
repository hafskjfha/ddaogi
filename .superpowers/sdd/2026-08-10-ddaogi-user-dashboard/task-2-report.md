# Task 2 Report: Rating, Tier, Quantile, and Streak Domain Rules

## Implementation

- Added eight exact `RATING_BANDS` entries with inclusive upper bounds, negative-rating normalization, and `getRatingBand`.
- Added normalized `ProblemTier` parsing and compact formatting for valid group/Roman-numeral pairs, with an Unrated fallback for missing or invalid values.
- Added a copy-sorting, linear-interpolation `quantile` utility that rejects non-finite and out-of-range percentiles.
- Added sequence and UTC calendar-day streak utilities, including deduplication and a trailing current streak that must end on the supplied `asOf` date.
- Daily streaks now strictly accept real `YYYY-MM-DD` calendar dates. Invalid activity dates are ignored and an invalid `asOf` date is inactive, preventing JavaScript date rollover and `NaN`-based non-termination.

## Tests and Results

- `npm test -- src/domain/rating.test.ts src/domain/problemTier.test.ts` — 24 passed after implementation.
- `npm test -- src/domain/statistics.test.ts src/domain/streak.test.ts` — 11 passed after implementation.
- `npm test -- src/domain` — 37 passed across 4 files (final).
- `npm test` — 38 passed across 5 files (final).
- `npm run lint` — passed.
- `npx tsc --noEmit` — passed.
- `git diff --check` — passed.

Vitest emits a pre-existing warning that `vite-tsconfig-paths` is deprecated now that Vite has native tsconfig path resolution; this task does not change test configuration.

## TDD RED/GREEN Evidence

1. Rating and problem-tier tests were added before production modules. Their first run failed with the expected unresolved `@/domain/rating` and `@/domain/problemTier` imports. After the modules were added, the focused run passed with 24 tests.
2. Quantile and streak tests were added before production modules. Their first run failed with the expected unresolved `@/domain/statistics` and `@/domain/streak` imports. After the modules were added, the focused run passed with 11 tests.
3. Independent review identified that JavaScript normalized impossible dates (for example, `2026-02-30`) and could create a `NaN` infinite loop for malformed active and `asOf` dates. The new regression test first failed with `{ current: 2, longest: 2 }` instead of the expected `{ current: 1, longest: 1 }`. Strict ISO date validation then made the focused streak suite pass with 7 tests and the final domain suite pass with 37 tests.

## Files Changed

- `src/domain/rating.ts`
- `src/domain/rating.test.ts`
- `src/domain/problemTier.ts`
- `src/domain/problemTier.test.ts`
- `src/domain/statistics.ts`
- `src/domain/statistics.test.ts`
- `src/domain/streak.ts`
- `src/domain/streak.test.ts`
- `.superpowers/sdd/2026-08-10-ddaogi-user-dashboard/task-2-report.md`

## Self-Review

- Confirmed the rating boundaries, title labels, and RGB values match the supplied analytics design.
- Confirmed public functions have JSDoc and production code is pure TypeScript with no filesystem, React, data, or route changes.
- Confirmed quantile input is not mutated, sequence current streak is trailing-only, and daily current streak is zero when `asOf` is inactive.
- Removed redundant tier-group validation after the regular expression already restricted valid groups.
- An independent reviewer checked the implementation, identified the invalid-date issue above, and no longer-blocking reviewer concerns were addressed.

## Concerns

- The brief declares a `ProblemTier.color` string but does not prescribe exact tier color values. The implementation uses the conventional BOJ tier palette; later UI work can consume these stable normalized values.
- The existing Vitest path-alias plugin warning remains outside this task's scope.
