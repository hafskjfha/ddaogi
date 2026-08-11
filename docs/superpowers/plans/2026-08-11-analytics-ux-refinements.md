# Analytics UX Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine both analytics dashboards with source-backed totals and links, contrast-safe rating/tier colors, correct KST dates, bounded problem lists, stable tooltips, and an explicit score-estimate explanation.

**Architecture:** Keep validation and DTO construction in server-only loaders, add one server-compatible rating text primitive, and isolate the contest-streak state machine in the smallest possible Client Component. Restore the user's rich contest fixture and new total-count fixture as validated runtime sources instead of hardcoding UI facts.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript strict mode, Tailwind CSS 4, Radix Tooltip, Recharts, Vitest, Testing Library.

## Global Constraints

- Read relevant installed Next.js guidance under `node_modules/next/dist/docs/` before code changes; use the generated `PageProps` flow and keep Client Component props serializable.
- Preserve the main worktree's uncommitted files and `stash@{0}`; stage only files explicitly owned by the current task.
- Use strict RED-GREEN-REFACTOR for every behavior change and record the exact expected failure before production edits.
- Do not add dependencies or change the existing score-estimate mathematics.
- Use static Tailwind class maps for rating and problem-tier text/background colors; inline styles remain limited to existing data-driven chart geometry.
- All DOJ external links use `target="_blank"`, `rel="noreferrer"`, keyboard-visible focus, and source-validated HTTPS URLs.
- Preserve filename-labelled loader failures and original JSON parse causes.
- Do not stage `docs/requirements.md`, `data/readme.md`, existing SDD reports, or the pre-merge stash.
- Finish every task with focused tests, full affected-area tests, `git diff --check`, a scoped self-review, and a scoped commit.

---

### Task 1: Shared rating semantics and user rating displays

**Files:**
- Create: `src/components/RatingText.tsx`
- Create: `src/components/RatingText.test.tsx`
- Modify: `src/features/user/components/RatingHistoryChart.tsx`
- Modify: `src/features/user/components/RatingOverview.test.tsx`
- Modify: `src/features/user/components/ContestHistoryTable.tsx`

**Interfaces:**
- Consumes: `getRatingBand(rating: number): RatingBand`, `RatingTitle`, and nullable rating changes.
- Produces: `RatingText`, `RatingTitleText`, `RatingDelta`, plus static theme-safe class selection reused by later contest components.

- [ ] **Step 1: Write failing primitive tests**

Add literal, behavior-level assertions that make the following mutations fail: using one color for every band, swapping positive/negative colors, treating zero as positive, or coloring an unavailable value.

```tsx
render(
  <>
    <RatingText rating={1429}>1,429</RatingText>
    <RatingText rating={2286}>2,286</RatingText>
    <RatingDelta value={53} />
    <RatingDelta value={-8} />
    <RatingDelta value={0} />
    <RatingDelta value={null} />
  </>,
);

expect(screen.getByText("1,429")).toHaveClass("text-teal-700", "dark:text-teal-400");
expect(screen.getByText("2,286")).toHaveClass("text-red-700", "dark:text-red-400");
expect(screen.getByText("+53")).toHaveClass("text-emerald-700", "dark:text-emerald-400");
expect(screen.getByText("-8")).toHaveClass("text-red-700", "dark:text-red-400");
expect(screen.getByText("0")).toHaveClass("text-slate-700", "dark:text-slate-300");
expect(screen.getByText("-")).toHaveClass("text-slate-500", "dark:text-slate-400");
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm test -- src/components/RatingText.test.tsx
```

Expected: FAIL because `@/components/RatingText` does not exist.

- [ ] **Step 3: Implement the static rating primitives**

Create a literal `Record<RatingTitle, string>` using contrast-safe light/dark classes:

```ts
const RATING_TEXT_CLASSES: Record<RatingTitle, string> = {
  NEWBIE: "text-slate-700 dark:text-slate-300",
  PUPIL: "text-green-700 dark:text-green-400",
  SPECIALIST: "text-teal-700 dark:text-teal-400",
  EXPERT: "text-blue-700 dark:text-blue-400",
  CANDIDATE_MASTER: "text-violet-700 dark:text-violet-400",
  MASTER: "text-orange-700 dark:text-orange-400",
  INTERNATIONAL_MASTER: "text-red-700 dark:text-red-400",
  GRANDMASTER: "text-red-800 dark:text-red-300",
};
```

`RatingText` selects by numeric rating, `RatingTitleText` selects by title, and `RatingDelta` renders the signed literal plus semantic class. Each exported component/function receives concise JSDoc.

- [ ] **Step 4: Verify primitive GREEN**

Run the focused command from Step 2. Expected: all primitive tests PASS.

- [ ] **Step 5: Write failing chart/table integration tests**

Extend `RatingOverview.test.tsx` to open a real chart tooltip and assert:

- rating `1,429` has specialist text classes;
- performance `1,587` has specialist text classes;
- `+53` is emerald and `-8` is red;
- the history row colors performance and rating independently;
- `NEWBIE → SPECIALIST` renders two separately colored title spans with a neutral arrow;
- unrated `-` values stay neutral.

Run:

```powershell
npm test -- src/features/user/components/RatingOverview.test.tsx
```

Expected: FAIL because the values are currently unstyled plain text.

- [ ] **Step 6: Apply primitives to chart tooltip and history table**

Replace local signed formatting in the visible tooltip/table with the shared primitives. Keep `pointSummary()` textual and signed for the accessible details list. Derive `ratingBefore` as `ratingAfter - ratingDiff` only when the contest is rated, and use the already normalized `tierBefore`/`tierAfter` for colored title text.

- [ ] **Step 7: Verify, refactor, and commit**

Run:

```powershell
npm test -- src/components/RatingText.test.tsx src/features/user/components/RatingOverview.test.tsx
npm test
git diff --check
```

Commit only the five Task 1 files:

```powershell
git add src/components/RatingText.tsx src/components/RatingText.test.tsx src/features/user/components/RatingHistoryChart.tsx src/features/user/components/RatingOverview.test.tsx src/features/user/components/ContestHistoryTable.tsx
git commit -m "feat: color user rating details"
```

---

### Task 2: Source-backed user totals, exact facts, supplied tiers, and KST dates

**Files:**
- Add: `data/problems.json`
- Modify: `data/difficulty.json`
- Modify: `data/user_info.md`
- Create: `src/domain/kstDate.ts`
- Create: `src/domain/kstDate.test.ts`
- Modify: `src/domain/problemTier.ts`
- Modify: `src/domain/problemTier.test.ts`
- Modify: `src/features/user/data/parseUserInfo.ts`
- Modify: `src/features/user/data/parseUserInfo.test.ts`
- Modify: `src/features/user/data/loadUserDashboard.ts`
- Modify: `src/features/user/data/loadUserDashboard.test.ts`
- Modify: `src/features/user/data/buildUserDashboard.ts`
- Modify: `src/features/user/data/buildUserDashboard.test.ts`
- Modify: `src/features/user/model/types.ts`
- Modify: `src/test/fixtures/userDashboard.ts`

**Interfaces:**
- Consumes: user-provided `data/problems.json` with SHA-256 `9A18E938756A4BC064A497EB8D9FDDBBC5EC98E6B7E14BC62F36D0730ED34572` from the main worktree.
- Produces: validated availability totals, explicit `solvedRank: 9`, explicit `firstPlaceCount: 0`, five supplied partial tiers, and `toKstIsoDate(timestamp: string): string`.

- [ ] **Step 1: Write failing KST boundary tests**

```ts
expect(toKstIsoDate("2026-07-08T14:59:59.000Z")).toBe("2026-07-08");
expect(toKstIsoDate("2026-07-08T15:00:00.000Z")).toBe("2026-07-09");
```

Run `npm test -- src/domain/kstDate.test.ts`. Expected: FAIL because the helper is missing.

- [ ] **Step 2: Implement and verify KST conversion**

Implement a deterministic `Asia/Seoul` conversion using `Intl.DateTimeFormat(...).formatToParts()` and reject invalid timestamps with a `TypeError`. Run the focused test and expect PASS.

- [ ] **Step 3: Write failing source/DTO tests**

Extend parser, loader, and builder tests with independently derived literals:

```ts
expect(dashboard.profile.solvedRank).toBe(9);
expect(dashboard.profile.firstPlaceCount).toBe(0);
expect(dashboard.problems.find(({ id }) => id === "65")?.tier.shortLabel).toBe("G1");
expect(dashboard.problems.find(({ id }) => id === "94")?.tier.shortLabel).toBe("UR");
expect(dashboard.problems.find(({ id }) => id === "298")?.tier.shortLabel).toBe("S2");
expect(dashboard.problems.find(({ id }) => id === "348")?.tier.shortLabel).toBe("P4");
expect(dashboard.difficultyDetails.find(({ key }) => key === "Gold I")?.totalAvailable).toBe(12);
expect(dashboard.difficultyGroups.find(({ key }) => key === "Gold")?.totalAvailable).toBe(69);
```

Add malformed `problems.json` cases for a missing `UR`, extra `X1`, negative `B5`, non-integer `S2`, and non-object input. Each error must name `problems.json` and the exact key/reason. Add a loader JSON-syntax case that requires `cause` preservation.

Add a timestamp fixture whose full score occurs at `2026-07-08T15:00:00.000Z` and assert the first-full date/activity day is `2026-07-09`.

Run:

```powershell
npm test -- src/features/user/data src/domain/kstDate.test.ts
```

Expected: FAIL on absent inputs/fields, `U` labels, null facts, unavailable totals, and UTC-sliced dates.

- [ ] **Step 4: Add the user-provided sources**

Verify the main-worktree hash, copy `data/problems.json` into this worktree, and add these exact `difficulty.json` entries:

```json
"65": "Gold I",
"94": "Unrated",
"95": "Unrated",
"298": "Silver II",
"348": "Platinum IV"
```

Add explicit user-info source lines:

```md
대회 1등: 0번
만점 문제 랭킹: 9등
```

Keep the existing combined podium and first-full facts unchanged.

- [ ] **Step 5: Extend validation and DTO construction**

Read `problems.json` in `loadUserDashboard`, parse it from `unknown`, and pass a normalized tier-total map into `buildUserDashboard`. Require exactly 31 keys: `UR`, then five levels for each of B/S/G/P/D/R. Map compact labels to normalized `ProblemTier.label` values and aggregate group totals.

Update `parseUserInfo` to require the two explicit source fields. Replace UTC `.slice(0, 10)` usage for activity semantics with `toKstIsoDate`. Change the unrated short label in `problemTier.ts` and user group label map from `U` to `UR`.

- [ ] **Step 6: Verify GREEN and mutation resistance**

Run the focused command from Step 3. Temporarily mutate KST conversion back to UTC slicing and remove one totals key check; verify the corresponding tests fail, then restore production code and re-run green.

- [ ] **Step 7: Full verification and commit**

Run:

```powershell
npm test
npx next typegen
npx tsc --noEmit
git diff --check
```

Commit only Task 2 source/data/tests:

```powershell
git add data/problems.json data/difficulty.json data/user_info.md src/domain/kstDate.ts src/domain/kstDate.test.ts src/domain/problemTier.ts src/domain/problemTier.test.ts src/features/user/data src/features/user/model/types.ts src/test/fixtures/userDashboard.ts
git commit -m "feat: derive user problem analytics from sources"
```

---

### Task 3: User problem-list UX, stable contest tooltips, and profile metric placement

**Files:**
- Create: `src/features/user/components/ContestStreakCells.tsx`
- Modify: `src/features/user/components/ContestStreak.tsx`
- Modify: `src/features/user/components/RatingOverview.test.tsx`
- Modify: `src/features/user/components/ProblemList.tsx`
- Modify: `src/features/user/components/ProblemOverview.test.tsx`
- Modify: `src/features/user/components/UserProfileHero.tsx`
- Modify: `src/features/user/components/UserProfileHero.test.tsx`
- Modify: `src/features/user/components/MoreOverview.test.tsx`

**Interfaces:**
- Consumes: serializable `ContestCalendarEntry[]`, `ProblemSummary.tier`, and the explicit profile facts produced by Task 2.
- Produces: one-active-tooltip contest cells, independently scrollable problem regions, colored tier badges, and consolidated rank metrics.

- [ ] **Step 1: Write the contest-streak race regression**

Use fake timers and real Radix content. Hover the first cell until its tooltip opens, move to the second cell, then advance beyond the first cell's delayed close. Assert the first contest text is absent and the second remains. Repeat with focus/blur.

```ts
expect(screen.queryByText("DOJ Contest 1")).not.toBeInTheDocument();
expect(screen.getByText("DOJ Contest 2")).toBeInTheDocument();
```

Run `npm test -- src/features/user/components/RatingOverview.test.tsx`. Expected: FAIL because independent uncontrolled tooltip roots can retain stale content.

- [ ] **Step 2: Implement a narrow controlled Client Component**

Move only the cell group into `ContestStreakCells.tsx` with `"use client"`. Track `openIndex`. The close callback must use:

```ts
setOpenIndex((current) => (current === entry.index ? null : current));
```

The open callback sets the current entry index. Preserve trigger aria labels, keyboard focus rings, and tooltip copy. Keep `ContestStreak.tsx` as the server-rendered Card wrapper.

- [ ] **Step 3: Write failing problem-list and hero tests**

Assert both lists expose separate focusable regions named `만점 문제 목록` and `만점 미달 목록`, each with bounded height/vertical overflow classes. Assert a `#94` item displays `UR` with black/white badge classes and a `#65` item displays `G1` with gold classes. Assert link targets remain safe and partial tooltip score context remains.

Assert the hero has no duplicate `89등 · top 31.3%` subtitle, while the `레이팅 랭킹` card contains `89등` and `top 31.3%`, and the full-score card contains `만점 랭킹: 9등`. Assert the More card renders `0회` rather than unavailable copy.

Run focused component tests. Expected: FAIL on absent scroll regions, plain tier text, duplicate subtitle, and old fixture facts.

- [ ] **Step 4: Implement bounded lists, tier badges, and metric placement**

Pass an accessible list label from `ProblemOverview` to `ProblemList`. Wrap non-empty lists in a `tabIndex={0}` region using `max-h-[32rem] overflow-y-auto overscroll-contain pe-2`. Add a literal tier-group badge class map with black unrated, bronze, silver, gold, platinum, diamond, and ruby styles.

Remove the subtitle below the handle. Add the percentile inside the rating-rank card. Keep rank and percentile as separate text nodes with existing labels. The already explicit full-score rank and first-place facts then render without special cases.

- [ ] **Step 5: Verify, refactor, and commit**

Run:

```powershell
npm test -- src/features/user/components
npm test
npx tsc --noEmit
git diff --check
```

Commit only Task 3 files:

```powershell
git add src/features/user/components/ContestStreakCells.tsx src/features/user/components/ContestStreak.tsx src/features/user/components/RatingOverview.test.tsx src/features/user/components/ProblemList.tsx src/features/user/components/ProblemOverview.test.tsx src/features/user/components/UserProfileHero.tsx src/features/user/components/UserProfileHero.test.tsx src/features/user/components/MoreOverview.test.tsx
git commit -m "feat: refine user analytics interactions"
```

---

### Task 4: Rich contest source parsing and linked DTOs

**Files:**
- Modify: `data/contest_info.md`
- Modify: `src/features/contest/model/types.ts`
- Modify: `src/features/contest/data/parseContestInfo.ts`
- Modify: `src/features/contest/data/parseContestInfo.test.ts`
- Modify: `src/features/contest/data/loadContestDashboard.test.ts`
- Modify: `src/test/fixtures/contestDashboard.ts`

**Interfaces:**
- Consumes: the link-rich `contest_info.md` in `stash@{0}^3`, with the problem C nested-link typo corrected.
- Produces: `LinkedRatedUser`, `ContestSummary.href`, `ContestProblem.href`, and nullable `ContestProblem.firstFull` records.

- [ ] **Step 1: Write failing rich-Markdown parser tests**

Use a complete A-I literal fixture and assert these hand-derived values:

```ts
expect(parsed.contest.href).toBe("https://doj.kr/ko/contests/doj-beginner-contest-4");
expect(parsed.contest.director).toEqual({
  handle: "admin",
  rating: 1352,
  href: "https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h",
});
expect(parsed.problems[0].href).toBe("https://doj.kr/ko/problems/342");
expect(parsed.problems[0].firstFull).toEqual({
  handle: "jkrt",
  rating: 2369,
  href: "https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh",
  time: "0m 55s",
});
expect(parsed.problems[8].firstFull).toBeNull();
```

Add separate failures for HTTP URLs, a contest URL in a user field, a user URL in a problem field, a negative/non-integer profile rating, missing problem links, and malformed Markdown. Every error assertion requires `contest_info.md` and the field/problem index.

Run `npm test -- src/features/contest/data`. Expected: FAIL because the current parser accepts plain text and the DTO lacks links/ratings.

- [ ] **Step 2: Restore and correct the authoritative source**

Restore `data/contest_info.md` from `stash@{0}^3`. Correct only the malformed C first-full Markdown to:

```md
- FF: [RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (3m 54s)
```

Retain all other supplied contest, problem, staff, and first-full URLs/ratings.

- [ ] **Step 3: Implement typed link parsing and validation**

Replace string staff fields with:

```ts
export interface LinkedRatedUser {
  readonly handle: string;
  readonly rating: number;
  readonly href: string;
}
```

Add `href` to contest/problem DTOs and `firstFull: (LinkedRatedUser & { readonly time: string }) | null`. Parse Markdown anchors with anchored regular expressions, validate URL kind/path, require non-negative integer ratings, and preserve exact A-I ordering/count validation.

- [ ] **Step 4: Verify data and loader GREEN**

Run:

```powershell
npm test -- src/features/contest/data
npx tsc --noEmit
git diff --check
```

Temporarily accept any HTTPS URL and verify the mismatched-kind regression fails; restore validation and re-run green.

- [ ] **Step 5: Commit**

```powershell
git add data/contest_info.md src/features/contest/model/types.ts src/features/contest/data/parseContestInfo.ts src/features/contest/data/parseContestInfo.test.ts src/features/contest/data/loadContestDashboard.test.ts src/test/fixtures/contestDashboard.ts
git commit -m "feat: preserve contest source links"
```

---

### Task 5: Linked contest UI, estimate explanation/colors, and final integration

**Files:**
- Create: `src/features/contest/components/ScoreEstimateHelp.tsx`
- Modify: `src/features/contest/components/ContestHero.tsx`
- Modify: `src/features/contest/components/ContestHero.test.tsx`
- Modify: `src/features/contest/components/ContestProblemAnalysis.tsx`
- Modify: `src/features/contest/components/ContestProblemAnalysis.test.tsx`
- Modify: `src/features/contest/components/ScoreEstimateGrid.tsx`
- Modify: `src/features/contest/components/ContestDashboard.integration.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 1 rating primitives and Task 4 linked contest DTOs.
- Produces: safe linked contest/staff/problem/FF UI, exact formula help, rating-colored estimates, and final missing-FF copy.

- [ ] **Step 1: Write failing contest component tests**

Assert:

- contest title links to the supplied contest URL with `_blank`/`noreferrer`;
- director and setter links use supplied profile URLs and their rating classes;
- every problem title links to its supplied URL;
- every present FF link uses the supplied profile URL and rating classes;
- problem I renders exact text `없음` and not `아직 없음`;
- estimate `1,260` and `2,330` values use their independent rating-band classes;
- the question-mark button is named `예상 레이팅 산출 방식` and opens content containing `점수 이상`, `대회 전 레이팅`, `중앙값`, `10 단위`, and `감소하지 않도록` by pointer and keyboard.

Run:

```powershell
npm test -- src/features/contest/components
```

Expected: FAIL because links, rated user objects, help trigger, colors, and exact copy are absent.

- [ ] **Step 2: Implement safe linked UI and formula help**

Use native `<a>` for external DOJ destinations. Reuse `RatingText` for staff, FF users, and estimate values. Implement `ScoreEstimateHelp` as the narrow tooltip trigger/content component and render it once beside the semantic estimate column label for each responsive representation without duplicate accessible controls at the same breakpoint.

Change only the empty FF text to `없음`; preserve the existing time display for present FF entries.

- [ ] **Step 3: Update integration coverage and README**

Render the complete contest route composition using the real fixture. Assert one contest link, nine problem links, linked staff/FF users, the help trigger, and the absence of `아직 없음`. Update the README source map to include `data/problems.json`, rich contest links/ratings, KST activity semantics, and the estimate formula tooltip.

- [ ] **Step 4: Verify all automated gates**

Run:

```powershell
npm test -- src/features/contest/components src/app/contests
npm test
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
git diff --check
```

Expected: 0 failures/errors; only the known non-failing `vite-tsconfig-paths` migration advisory may remain.

- [ ] **Step 5: Responsive and interaction QA**

Run the Next dev server on an unused port and verify both `/users/jtw7913` and `/contests/doj-beginner-contest-4` at exact 390x844, 768x1024, and 1440x1000 viewports in light and dark themes. Confirm:

- no horizontal page overflow;
- both problem lists scroll independently without trapping keyboard focus;
- slow pointer movement across contest streak cells never shows stale information;
- chart/history colors, tier badges, and estimate colors remain readable;
- all external links expose the correct `href`, `_blank`, and `noreferrer`;
- the estimate formula tooltip stays within the viewport and opens by focus;
- KST-crossing regression dates display the expected day in tests and production fixture output remains coherent.

Capture representative user-problem, user-rating, and contest-analysis screenshots in the ignored SDD report directory, then stop only the exact dev/browser processes started for QA.

- [ ] **Step 6: Final self-review and commit**

Review the entire base-to-head diff against `docs/superpowers/specs/2026-08-11-analytics-ux-refinements-design.md`, re-run `git diff --check`, and commit only Task 5 files:

```powershell
git add src/features/contest/components/ScoreEstimateHelp.tsx src/features/contest/components/ContestHero.tsx src/features/contest/components/ContestHero.test.tsx src/features/contest/components/ContestProblemAnalysis.tsx src/features/contest/components/ContestProblemAnalysis.test.tsx src/features/contest/components/ScoreEstimateGrid.tsx src/features/contest/components/ContestDashboard.integration.test.tsx README.md
git commit -m "feat: refine contest analytics presentation"
```

- [ ] **Step 7: Independent review and acceptance**

Request an independent specification and quality review of `2573db1..HEAD`. Fix every Critical or Important finding through a fresh RED-GREEN cycle, re-run all gates, and obtain a clean follow-up verdict before branch handoff.
