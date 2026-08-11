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

## User-plan broad review Fix A

### Correction and implementation

- The original availability implementation incorrectly treated tier rows in `difficulty.json` plus result-only IDs as an authoritative total-problem universe. That fabricated denominators equal to the attempted dataset and enabled false live “전체 해결” markers.
- The live builder now emits `totalAvailable: null` for every difficulty group and detail row because this repository has no authoritative universe-count source.
- Removed the dead `buildAvailableProblemTiers` helper, its call, parameters, and availability count maps.
- Preserved the generic UI capability and its component fixture coverage for explicitly known positive denominators; no UI component or fixture was changed.

### TDD RED/GREEN evidence

- RED command: `npm test -- src/features/user/data/buildUserDashboard.test.ts -t "does not invent difficulty availability totals"`
  - Exit 1; 1 test failed and 7 were skipped.
  - Real fixture evidence showed fabricated values: Unrated `6`, Bronze `35`, Silver `44`, Gold `9`, Platinum `1`, Diamond `0`, and Ruby `0` instead of `null`.
- GREEN command: `npm test -- src/features/user/data/buildUserDashboard.test.ts`
  - Exit 0; 1 file and 8 tests passed.
- The regression now checks the literal real-fixture solved counts for Bronze `35`, Silver `44`, Gold `9`, and Platinum `1`, while asserting every group and every detail row has `totalAvailable: null`.

### Final verification

- `npm test -- src/features/user/data/buildUserDashboard.test.ts src/features/user/components/ProblemOverview.test.tsx` — exit 0; 2 files and 13 tests passed, including generic known-positive all-solved UI behavior.
- `npm test` — exit 0; 13 files and 73 tests passed.
- `npm run lint` — exit 0.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — exit 0; Next.js production build completed and generated `/`, `/_not-found`, and `/users/[handle]`.
- `git diff --check` — exit 0; only existing LF-to-CRLF checkout advisories were printed.
- Independent read-only review found no Critical or Important issues and assessed the fix as ready.

### Files and commit

- Committed files:
  - `src/features/user/data/buildUserDashboard.ts`
  - `src/features/user/data/buildUserDashboard.test.ts`
- Commit: `f3614c67cde962b3939984351fc06e136997f0aa` — `fix: avoid fabricated difficulty totals`
- This report section is intentionally not part of that commit, per the broad-review instruction.

### Self-review

- Confirmed the fix is at the normalization source and does not hide completion markers in the UI.
- Confirmed every live group/detail row uses an unknown denominator while solved counts and percentages remain unchanged.
- Confirmed the generic UI still renders a completion marker when a caller explicitly supplies a positive known total equal to the solved count.
- Confirmed no availability helper or attempted-tier denominator logic remains.
- Confirmed the three user-owned untracked files remain untouched.

## Final whole-app review Fix A

### Implementation

- Added a real-filesystem `loadUserDashboard` test suite using temporary source files and a `process.cwd()` spy, matching the established contest-loader test pattern.
- Added a filename-aware JSON syntax boundary in `loadUserDashboard.ts`. Syntax errors now name only `result.json` or `difficulty.json`, retain the native parser detail, and preserve the original `SyntaxError` as `cause`.
- Changed the pure builder's structural validation errors to name `result.json` or `difficulty.json` directly while preserving problem IDs and validation details.
- Kept `parseUserInfo(markdown)` outside both JSON error wrappers, so malformed Markdown retains its native `user_info.md` label and is never relabeled as a JSON source.
- Preserved the `unknown` raw boundary, direct `server-only` import, DTO outputs, fixtures, and all analytics behavior. No `any` or unsafe assertion was introduced.

### TDD RED/GREEN evidence

- Initial RED: `npm test -- src/features/user/data/loadUserDashboard.test.ts`
  - Exit 1; 1 file with 4 failed and 1 passed tests.
  - Both syntax cases exposed only the native JSON engine message, and both structural cases exposed generic `Invalid results input` / `Invalid difficulty input` messages without their filenames.
  - The malformed Markdown isolation case already passed, confirming `user_info.md` was not relabeled before implementation.
- Initial GREEN: `npm test -- src/features/user/data/loadUserDashboard.test.ts`
  - Exit 0; 1 file and 5 tests passed.
- Review-driven cause/detail mutation RED: `npm test -- src/features/user/data/loadUserDashboard.test.ts -t "JSON syntax"`
  - With `{ cause: error }` temporarily removed, exit 1; 2 failed and 3 skipped tests.
  - Both failures reported `expected undefined to be an instance of SyntaxError`, proving the regression detects discarded causes.
- Restored GREEN: `npm test -- src/features/user/data/loadUserDashboard.test.ts`
  - Exit 0; 1 file and 5 tests passed with safely narrowed cause/message assertions.

### Final verification

- `npm test -- src/features/user/data` — exit 0; 3 files and 20 tests passed.
- `npm test` — exit 0; 25 files and 131 tests passed.
- `npm run lint` — exit 0.
- `npx next typegen` — exit 0; route types generated successfully.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — exit 0; Next.js production build completed for `/`, `/_not-found`, `/contests/[contestSlug]`, and `/users/[handle]`.
- `git diff --check` — exit 0; only existing LF-to-CRLF checkout advisories were printed.
- Independent review initially found cause/detail assertions missing; the review-driven mutation regression was added, and follow-up review found no remaining Critical or Important issues with assessment `Ready Yes`.

### Files and commit

- Committed files:
  - `src/features/user/data/loadUserDashboard.ts`
  - `src/features/user/data/loadUserDashboard.test.ts`
  - `src/features/user/data/buildUserDashboard.ts`
- Commit: `07ce12ffdb948046a6947365980a5705b9cd9cd0` — `fix: label user data source errors`
- This report section remains intentionally uncommitted.

### Self-review and concerns

- Confirmed each JSON syntax/structure branch names its own source and excludes the other JSON filename.
- Confirmed the original JSON syntax error survives as `cause` and its message remains in the wrapper.
- Confirmed malformed `user_info.md` is not inside any JSON catch block.
- Confirmed structural validators still expose specific problem IDs and reasons.
- Confirmed only the scoped loader, builder, and loader test were committed; the pre-existing report modification and `docs/requirements.md` remain unstaged.
- The only concern is the pre-existing Vitest advisory recommending native `resolve.tsconfigPaths`; it is unrelated to this fix.

## Final whole-app review Fix A Round 2

### Test hardening

- Strengthened both top-level structural loader cases to require the relevant filename and the semantic `expected a problem record` validator detail while excluding the other JSON filename.
- Added result record coverage for offending ID `problem-17` and missing submissions.
- Added difficulty record coverage for offending ID `problem-23` and the required string-tier detail.
- Kept filename, semantic detail, and problem-ID expectations separate so equivalent punctuation or quoting does not break the tests.
- Production code was restored exactly after the mutation check; the committed change is test-only.

### TDD mutation RED/GREEN evidence

- Temporary mutation changed both structural helpers to return filename-only errors and discarded their message argument.
- RED: `npm test -- src/features/user/data/loadUserDashboard.test.ts -t "structure|problem details"`
  - Exit 1; 1 file with 4 failed and 3 skipped tests.
  - The two top-level cases rejected missing `expected a problem record` detail.
  - The two record-specific cases rejected missing problem IDs and validator reasons.
- GREEN: `npm test -- src/features/user/data/loadUserDashboard.test.ts src/features/user/data/buildUserDashboard.test.ts`
  - Exit 0; 2 files and 16 tests passed after restoring the existing structural messages.

### Final verification

- `npm test -- src/features/user/data/loadUserDashboard.test.ts src/features/user/data/buildUserDashboard.test.ts` — exit 0; 2 files and 16 tests passed.
- `npm test` — exit 0; 25 files and 133 tests passed.
- `npm run lint` — exit 0.
- `npx next typegen` — exit 0; route types generated successfully.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — exit 0; Next.js production build completed for `/`, `/_not-found`, `/contests/[contestSlug]`, and `/users/[handle]`.
- `git diff --check` — exit 0; only existing LF-to-CRLF checkout advisories were printed.
- Independent review initially found punctuation coupling in the strengthened regexes. Expectations were separated by semantic concern, and follow-up review found no remaining Critical or Important issues with assessment `Ready Yes`.

### Files, commit, and self-review

- Committed file: `src/features/user/data/loadUserDashboard.test.ts`.
- Commit: `ea84cc0de42d9a7a9b743bf94b81272f6ac4f237` — `test: preserve user source error details`.
- Confirmed filename-only errors fail all four strengthened structural cases.
- Confirmed result and difficulty paths each retain source isolation and useful record-specific details.
- Confirmed no production file differs from Round 2 base after restoration.
- Confirmed this report and `docs/requirements.md` remain unstaged.
- No new concerns beyond the unrelated, pre-existing Vitest `resolve.tsconfigPaths` advisory.
