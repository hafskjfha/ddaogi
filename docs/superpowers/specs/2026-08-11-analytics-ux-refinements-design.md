# Analytics UX Refinements Design

## Goal

Improve the user and contest analytics dashboards with source-driven totals and links, consistent rating/tier color semantics, correct KST activity dates, bounded problem lists, reliable contest-streak tooltips, and clearer score-estimate explanations.

## Scope

### User analytics

- Color positive rating changes green, negative changes red, and zero or unavailable changes neutrally in chart tooltips and contest history.
- Color rating and performance values by their rating band. Use darker, contrast-safe light-theme colors and brighter dark-theme colors while preserving each band's identity.
- Color both title names in a title transition independently.
- Ensure only the currently hovered or focused contest streak cell can display information; a delayed close from a previous cell must not clear or resurrect another cell's tooltip.
- Give the full-score and partial-score problem lists independent, keyboard-scrollable containers with a bounded height.
- Display `UR` for unrated problems and use group-specific problem-tier badges: black, bronze, silver, gold, platinum, diamond, and ruby.
- Add the supplied partial-problem tiers: `#65 G1`, `#94 UR`, `#95 UR`, `#298 S2`, and `#348 P4`.
- Use `data/problems.json` as the validated source of total available problems for every detailed tier and aggregated tier group.
- Report the user's full-score rank as 9th and exact first-place count as zero from explicit source fields.
- Convert submission timestamps to `Asia/Seoul` calendar dates before deriving first-full dates, daily solve counts, streak boundaries, and labels.
- Remove the duplicate rank/percentile subtitle under the handle and show both values in the rating-rank metric card.

### Contest analytics

- Add a keyboard- and pointer-accessible help tooltip beside the score-estimate heading.
- Explain the existing algorithm exactly: for each 25/50/75/100 threshold, select rated participants whose score is at least that threshold, take the median of their pre-contest ratings, round to the nearest 10, and clamp later thresholds so estimates never decrease.
- Color every non-null estimate by its rating band with the same contrast-safe theme palette.
- Restore the link-rich `contest_info.md` source preserved in `stash@{0}`, correcting the malformed nested Markdown for problem C.
- Parse and validate the contest URL, problem URLs, and staff/first-full profile references and ratings rather than stripping them.
- Render the contest title, every problem title, staff handle, and first-full handle as safe DOJ links. Color staff and first-full handles by their supplied rating.
- Change the missing first-full copy from `아직 없음` to `없음`.

## Architecture

### Shared presentation primitives

Add a small server-compatible rating text primitive under `src/components/` with static Tailwind class maps. It will expose three uses:

- rating number text selected from a numeric rating;
- title text selected from a normalized rating title;
- signed rating delta text selected from a nullable number.

Static class maps keep Tailwind discovery deterministic. Color remains supplemental: signs, labels, arrows, and numeric text retain their semantic meaning without color.

Problem-tier badges use an equivalent static group-to-class map. `ProblemTier.shortLabel` becomes `UR` for unrated data everywhere, and the unrated badge is black with white text in both themes.

### Server and client boundaries

Loaders, validators, DTO builders, tables, lists, and static link rendering remain Server Components or server-only modules. The Recharts rating chart remains a Client Component. Contest-streak control is isolated in a narrow Client Component receiving only serializable entries; the surrounding card stays server-rendered. The score-estimate explanation reuses the existing client tooltip primitive without moving the full contest table across a new client boundary.

### User data flow

`loadUserDashboard` reads `result.json`, `difficulty.json`, `problems.json`, and `user_info.md` on the server. Each raw JSON boundary remains `unknown` until validation.

`problems.json` must contain exactly `UR` plus `B5` through `R1`; every value must be a non-negative integer. Detailed distributions receive the matching total, and group distributions receive the sum of their five levels. Solved counts still derive only from full-score submissions.

`user_info.md` gains explicit `만점 문제 랭킹: 9등` and `대회 1등: 0번` fields. These are parsed independently from the combined podium count, so no podium-to-first-place inference is introduced.

The five supplied partial tiers are added to `difficulty.json`. Missing difficulty still normalizes to `UR`, but these known problems no longer rely on that fallback.

All source timestamps remain unchanged in the submission DTO. A focused date helper converts each instant to a `YYYY-MM-DD` KST date for first-full selection, activity aggregation, `asOf`, and streak calculation.

### Contest data flow

The restored Markdown is the authoritative runtime fixture. Parsing produces:

- a validated contest `href`;
- linked rated staff records for director and setter;
- a validated problem `href` for each ordered A-I problem;
- a linked rated first-full user plus time, or `null`.

Only `https://doj.kr/ko/contests/...`, `https://doj.kr/ko/problems/<number>`, and `https://doj.kr/ko/user/...` references are accepted for their corresponding fields. Errors retain `contest_info.md` and the offending field/block context.

All external anchors open in a new tab with `rel="noreferrer"`, have visible focus treatment, and keep full text available to assistive technology.

## Interaction details

### Rating chart and contest history

The chart tooltip colors `ratingAfter` and `performanceRating` independently from their values. The delta uses emerald for positive, red for negative, and neutral slate for zero or unavailable. Contest-history cells reuse the same primitives. For a title transition, both endpoints are separate colored spans around a neutral arrow.

### Contest streak

Each cell uses a controlled tooltip keyed by contest index. State updates clear a tooltip only when the closing event belongs to the currently active index. Moving slowly from one cell to another therefore cannot allow the previous cell's delayed close event to overwrite the new active entry. Pointer leave and blur close the matching tooltip, and keyboard focus opens the same information.

### Problem lists

Each list receives its own `max-h-[32rem] overflow-y-auto overscroll-contain` region with an accessible label and keyboard focus. Tier badges remain visible beside truncated titles; full titles remain available in the existing tooltip. Partial score context remains in both the card and tooltip.

### Score estimates

The help trigger is a labeled question-mark button next to `점수별 예상 레이팅`, available in desktop and mobile labels without duplicate accessible names. The explanation states the exact algorithm and that `-` means no rated participant reached the threshold. Estimate values use rating-band text colors; the placeholder remains neutral.

## Error handling

- Invalid or missing `problems.json` keys, non-integer totals, negative totals, and unknown extra keys fail with `Invalid problems.json` and precise key context.
- Invalid contest Markdown links, profile ratings, mismatched URL kinds, missing problem links, and malformed first-full references fail with `contest_info.md` plus the affected label or problem index.
- JSON syntax errors preserve their original `cause` and source filename.
- No UI silently fabricates totals, links, ratings, ranks, or first-place counts.

## Testing strategy

Every behavior change follows RED-GREEN-REFACTOR.

- Domain/component tests lock the static contrast-safe rating classes, signed delta classes, `UR` label, and tier badge classes.
- Chart and table tests assert independently colored rating, performance, delta, and title-transition values while retaining text alternatives.
- Fake-timer interaction tests move slowly across contest cells and prove only the current tooltip is present after delayed close events; focus/blur is covered separately.
- User data tests validate `problems.json`, exact availability totals, supplied partial tiers, explicit rank/first-place values, and UTC instants that cross a KST date boundary.
- Problem-list tests assert independent bounded scroll regions, accessible labels, link safety, and tier presentation.
- Contest parser tests cover rich Markdown links, all supplied profile ratings, the corrected C row, URL-kind rejection, and source-labelled errors.
- Contest component tests cover link targets/relations, nickname colors, score-estimate help content and keyboard access, estimate colors, and `없음` copy.
- Final verification runs focused tests, the full suite, ESLint, Next type generation, strict TypeScript, production build, diff checks, and responsive light/dark browser QA for the affected routes.

## Non-goals

- No API, database, authentication, or navigation expansion.
- No change to the established rating-estimate mathematics.
- No broad dashboard client-boundary refactor.
- No unrelated cleanup of previously deferred minor findings.
