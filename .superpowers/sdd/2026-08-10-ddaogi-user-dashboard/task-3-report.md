# Task 3 Report: User Mock-Data Parsing and Dashboard Normalization

## Implementation

- Added the serializable user dashboard DTO boundary in `src/features/user/model/types.ts`, reusing the authoritative `ProblemTier`, `RatingTitle`, and `StreakSummary` domain contracts.
- Added a pure, section-aware `user_info.md` parser that validates expected sections, headers, and row widths; normalizes dotted and Korean calendar dates through UTC; preserves contest names; extracts the initial rating; represents missing performance/diff values as `null`; and matches calendar participation by normalized date plus name.
- Added pure dashboard normalization from `unknown` JSON inputs with explicit record and per-submission validation. It rejects malformed timestamps, impossible UTC dates, scores outside their contemporaneous maximum, inconsistent titles, and invalid supplied difficulty tiers.
- Normalized problem summaries, evolving problem maxima, earliest contemporaneous full-score dates, rating history and title transitions, contest and problem-solving streaks, deterministic difficulty/language distributions, submission totals, and missing-difficulty `Unrated` fallbacks.
- Counted distribution availability from the union of difficulty records and result problem IDs, so missing difficulty entries cannot produce `count > totalAvailable`.
- Added a `server-only` filesystem loader for the supported mock handle, keeping all production filesystem I/O in `loadUserDashboard.ts`.
- Added and authorized the three supplied mock fixtures: `data/user_info.md`, `data/result.json`, and `data/difficulty.json`.

## TDD RED/GREEN Evidence

1. Parser contract RED:
   - Command: `npm test -- src/features/user/data/parseUserInfo.test.ts`
   - Result: exit 1; 1 failed suite, 0 tests; expected unresolved `@/features/user/data/parseUserInfo` import.
2. Parser contract GREEN:
   - Same command after implementation.
   - Result: exit 0; 1 test file and 3 tests passed.
3. Dashboard contract RED:
   - Command: `npm test -- src/features/user/data/buildUserDashboard.test.ts`
   - Result: exit 1; 1 failed suite, 0 tests; expected unresolved `@/features/user/data/buildUserDashboard` import.
4. Evolving problem-maximum regression RED:
   - Command: `npm test -- src/features/user/data/buildUserDashboard.test.ts -t "accepts an evolving problem maximum"`
   - Result: exit 1; the validator rejected the legitimate changing `p_maxscore` values for problem 97.
5. Evolving problem-maximum regression GREEN:
   - Command: `npm test -- src/features/user/data/buildUserDashboard.test.ts`
   - Result: exit 0; 1 test file and 4 tests passed, including the real 90 solved / 5 partial / 215 submission fixture contract.
6. Review-driven boundary regressions RED:
   - Command: `npm test -- src/features/user/data/parseUserInfo.test.ts src/features/user/data/buildUserDashboard.test.ts`
   - Result: exit 1; 4 tests failed as expected for score-above-max, impossible ISO date, invalid supplied difficulty, and malformed Markdown row width.
7. Duplicate contest-name regression RED:
   - Command: `npm test -- src/features/user/data/parseUserInfo.test.ts -t "matches participation by date and name"`
   - Result: exit 1; the earlier name-only matcher incorrectly returned `true` for the duplicate calendar entry.
8. Missing-difficulty availability regression RED:
   - Command: `npm test -- src/features/user/data/buildUserDashboard.test.ts -t "normalizes submissions and uses Unrated"`
   - Result: exit 1; expected Unrated `totalAvailable: 1`, received `0`.
9. Final focused GREEN before the final verification gate:
   - Command: `npm test -- src/features/user/data`
   - Result: exit 0; 2 test files and 13 tests passed.

## Verification Results

- `npx tsc --noEmit` — exit 0.
- `npm run lint -- src/features/user` — exit 0 with no errors or warnings from the Task 3 files.
- `npm test -- src/features/user/data` — 2 files, 13 tests passed.
- `npm test` — exit 0; final fresh full repository suite passed with 7 files and 51 tests.
- Independent read-only review found six Important boundary/invariant issues. Regression tests were added first, all six were fixed, and follow-up review reported no remaining Critical or Important issues with a “Ready to merge: Yes” assessment.

## Files Changed

- `data/user_info.md`
- `data/result.json`
- `data/difficulty.json`
- `src/features/user/model/types.ts`
- `src/features/user/data/parseUserInfo.ts`
- `src/features/user/data/parseUserInfo.test.ts`
- `src/features/user/data/buildUserDashboard.ts`
- `src/features/user/data/buildUserDashboard.test.ts`
- `src/features/user/data/loadUserDashboard.ts`
- `.superpowers/sdd/2026-08-10-ddaogi-user-dashboard/task-3-report.md`

## Self-Review

- Confirmed parser and normalization functions are pure; production filesystem reads occur only in the `server-only` loader.
- Confirmed raw JSON enters as `unknown`, is narrowed through explicit guards, and does not leak `unknown` or `any` into normalized DTOs.
- Confirmed the actual fixture produces 95 problem summaries, 90 solved problems, 5 partial problems, 215 submissions, and a final rating of 1429.
- Confirmed dates are represented as strings, UTC calendar operations do not depend on host timezone, and DTOs contain only serializable arrays and plain objects.
- Confirmed deterministic ordering for problem IDs, submissions, tier groups/details, and languages.
- Confirmed the evolving maximum in problem 97 is treated as valid and each submission retains its contemporaneous maximum.
- Confirmed the out-of-scope `data/contest_info.md`, `data/contest_score_board.json`, and `docs/requirements.md` remain untouched and unstaged.

## Concerns

- Vitest prints a pre-existing advisory that `vite-tsconfig-paths` can be replaced by Vite's native `resolve.tsconfigPaths`; this task does not modify test configuration.
- No known functional concerns remain for Task 3.
