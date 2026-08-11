# Profile Introduction and Score Estimates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the DOJ profile introduction, simplify two user-analysis labels, and replace fixed score/median contest estimates with scoreboard-selected thresholds and a kenkoooo-style IRT estimate.

**Architecture:** Extend the existing Markdown-to-dashboard profile pipeline for the introduction and keep display-only wording in the current presentation components. Replace the fixed `ScoreEstimates` object with a serializable array, select observed partial-score quartiles plus 100 in the contest data builder, and estimate each threshold with the same fixed-slope logistic model used by kenkoooo's estimator.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript 5, Tailwind CSS 4, Vitest 4, React Testing Library

## Global Constraints

- Read and follow `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
- Preserve the user's existing `문제 풀이 랭킹` edits in `UserProfileHero.tsx` and `UserProfileHero.test.tsx`.
- The introduction limit is 500 Unicode code points and at most 6 LF line breaks; an empty introduction is valid.
- Score thresholds are nearest-rank quartiles of observed scores satisfying `0 < score < 100`, deduplicated, with 100 always appended and the final list sorted ascending.
- Rating estimation uses only entries with a supplied pre-contest rating and `P(success | r, d) = 1 / (1 + 6^((d - r) / 400))`.
- Return `null` when no rated participant, no success, or all rated participants succeed at a threshold.
- Do not add a dependency; keep all derived data serializable across Server/Client Component boundaries.
- Required final checks are `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`.

---

### Task 1: Parse and render the DOJ profile introduction

**Files:**
- Modify: `data/user_info.md`
- Modify: `src/features/user/model/types.ts`
- Modify: `src/features/user/data/parseUserInfo.ts`
- Modify: `src/features/user/data/parseUserInfo.test.ts`
- Modify: `src/features/user/data/buildUserDashboard.test.ts`
- Modify: `src/test/fixtures/userDashboard.ts`
- Modify: `src/features/user/components/UserProfileHero.tsx`
- Modify: `src/features/user/components/UserProfileHero.test.tsx`

**Interfaces:**
- Produces: `UserProfile.introduction: string`
- Produces: `parseUserInfo(markdown).profile.introduction`
- Consumes: the existing `ParsedUserInfo.profile` spread in `buildUserDashboard`

- [ ] **Step 1: Write failing parser and rendering tests**

Add these assertions to the real Markdown parser test:

```ts
expect(result.profile.introduction).toBe("PS/CP 초보");
```

Add a table-driven boundary test using the existing source Markdown:

```ts
it("enforces the DOJ introduction character and line-break limits", () => {
  const replaceIntroduction = (value: string) =>
    markdown.replace("PS/CP 초보", value);

  expect(parseUserInfo(replaceIntroduction("가".repeat(500))).profile.introduction).toHaveLength(500);
  expect(parseUserInfo(replaceIntroduction("1\n2\n3\n4\n5\n6\n7")).profile.introduction)
    .toBe("1\n2\n3\n4\n5\n6\n7");
  expect(() => parseUserInfo(replaceIntroduction("가".repeat(501))))
    .toThrow(/user_info\.md.*500/i);
  expect(() => parseUserInfo(replaceIntroduction("1\n2\n3\n4\n5\n6\n7\n8")))
    .toThrow(/user_info\.md.*6/i);
});
```

Add `introduction: "PS/CP 초보"` to both profile literals in `UserProfileHero.test.tsx`, assert `PS/CP 초보` is rendered after the title, and add a multiline case that asserts the rendered element has `whitespace-pre-wrap` and `break-words`. Add `introduction: "PS/CP 초보"` to `userDashboardFixture.profile`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
npx vitest run src/features/user/data/parseUserInfo.test.ts src/features/user/components/UserProfileHero.test.tsx src/features/user/data/buildUserDashboard.test.ts
```

Expected: FAIL because `introduction` is absent from the type/parser/fixture and `PS/CP 초보` is not rendered.

- [ ] **Step 3: Add the source field and minimal validated parser**

Insert the source section after the rating section:

```md
## 소개
PS/CP 초보
```

Add `readonly introduction: string` to `UserProfile`. In `parseUserInfo.ts`, add `INTRODUCTION_HEADING = "## 소개"`, read the section in `parseUserInfo`, and merge this helper result into the profile:

```ts
function parseIntroduction(lines: readonly string[]): string {
  const introduction = lines.join("\n").trim();
  const characterCount = [...introduction].length;
  const lineBreakCount = introduction.length === 0 ? 0 : introduction.split("\n").length - 1;

  if (characterCount > 500) {
    throw invalidUserInfo("introduction must contain at most 500 characters");
  }
  if (lineBreakCount > 6) {
    throw invalidUserInfo("introduction must contain at most 6 line breaks");
  }
  return introduction;
}
```

Render the non-empty value immediately after the title paragraph:

```tsx
{profile.introduction ? (
  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">
    {profile.introduction}
  </p>
) : null}
```

Update the parser and dashboard tests to assert that the value reaches `dashboard.profile.introduction` unchanged.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused Vitest command. Expected: all selected tests PASS with no warnings.

- [ ] **Step 5: Commit the task**

```powershell
git add data/user_info.md src/features/user/model/types.ts src/features/user/data/parseUserInfo.ts src/features/user/data/parseUserInfo.test.ts src/features/user/data/buildUserDashboard.test.ts src/test/fixtures/userDashboard.ts src/features/user/components/UserProfileHero.tsx src/features/user/components/UserProfileHero.test.tsx
git commit -m "feat: show validated DOJ profile introductions"
```

---

### Task 2: Simplify user distribution labels

**Files:**
- Modify: `src/features/user/data/buildUserDashboard.ts`
- Modify: `src/features/user/data/buildUserDashboard.test.ts`
- Modify: `src/features/user/components/LanguageDistribution.tsx`
- Modify: `src/features/user/components/MoreOverview.test.tsx`
- Modify: `src/features/user/components/DifficultyDistribution.tsx`
- Modify: `src/features/user/components/ProblemOverview.test.tsx`

**Interfaces:**
- Produces: language items whose `custom-json` display label is `기타`
- Preserves: `DistributionItem.totalAvailable` for fully-solved icon logic

- [ ] **Step 1: Write failing language and difficulty behavior tests**

In `buildUserDashboard.test.ts`, assert the real fixture item:

```ts
expect(dashboard.languages.find(({ key }) => key === "custom-json")).toMatchObject({
  label: "기타",
  shortLabel: "기타",
});
```

Change the final language legend literal in `MoreOverview.test.tsx` to `기타1회 (6.7%)` and assert `screen.queryByText("Custom JSON")` is absent.

In the difficulty legend test, assert the count/percentage remains and denominator copy is absent before and after toggling:

```ts
expect(groupLegend).toHaveTextContent("1개 (100%)");
expect(groupLegend).not.toHaveTextContent(/개 중/);
expect(groupLegend).not.toHaveTextContent("집계 미제공");
// toggle detail
expect(detailLegend).not.toHaveTextContent(/개 중/);
expect(detailLegend).not.toHaveTextContent("집계 미제공");
expect(screen.getByLabelText("Bronze V 전체 해결")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
npx vitest run src/features/user/data/buildUserDashboard.test.ts src/features/user/components/MoreOverview.test.tsx src/features/user/components/ProblemOverview.test.tsx
```

Expected: FAIL on `Custom JSON` and the current denominator/unavailable copy.

- [ ] **Step 3: Apply the minimal label changes**

Change both `LANGUAGE_LABELS["custom-json"]` values to `"기타"`. Remove the secondary `<span>` that renders `totalAvailable` from `DifficultyDistribution`, leaving `item.count` and `item.percentage` unchanged. Keep the `fullySolved` condition unchanged.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the same focused Vitest command. Expected: all selected tests PASS.

- [ ] **Step 5: Commit the task**

```powershell
git add src/features/user/data/buildUserDashboard.ts src/features/user/data/buildUserDashboard.test.ts src/features/user/components/LanguageDistribution.tsx src/features/user/components/MoreOverview.test.tsx src/features/user/components/DifficultyDistribution.tsx src/features/user/components/ProblemOverview.test.tsx
git commit -m "fix: simplify user distribution labels"
```

---

### Task 3: Select observed score thresholds and fit IRT estimates

**Files:**
- Modify: `src/features/contest/model/types.ts`
- Modify: `src/features/contest/data/buildContestDashboard.ts`
- Modify: `src/features/contest/data/buildContestDashboard.test.ts`

**Interfaces:**
- Produces: `ScoreEstimate { readonly score: number; readonly rating: number | null }`
- Produces: `ScoreEstimates = readonly ScoreEstimate[]`
- Produces: `selectScoreThresholds(entries, problemIndex): readonly number[]`
- Produces: `estimateProblemRatings(entries, problemIndex): ScoreEstimates`

- [ ] **Step 1: Write failing threshold-selection tests**

Export `selectScoreThresholds` in the test import and add a controlled scoreboard whose first-problem partial scores are `10, 20, 30, 40, 50`, plus a 0 and a 100. Assert hand-derived nearest-rank results:

```ts
expect(selectScoreThresholds(entries, 0)).toEqual([20, 30, 40, 100]);
```

Add cases proving deduplication and mandatory full score:

```ts
expect(selectScoreThresholds(parseScoreboard(allFullRows), 0)).toEqual([100]);
expect(selectScoreThresholds(parseScoreboard(repeatedPartialRows), 0)).toEqual([34, 100]);
```

- [ ] **Step 2: Run the data test and verify RED**

Run:

```powershell
npx vitest run src/features/contest/data/buildContestDashboard.test.ts
```

Expected: FAIL because `selectScoreThresholds` is not exported and estimates still have fixed fields.

- [ ] **Step 3: Replace the score estimate type and implement threshold selection**

Replace the fixed object fields with:

```ts
export interface ScoreEstimate {
  readonly score: number;
  readonly rating: number | null;
}

export type ScoreEstimates = readonly ScoreEstimate[];
```

Implement integer-index validation in one helper used by both public functions. Select and sort partial scores, calculate nearest-rank positions with `Math.ceil(percentile * values.length) - 1`, deduplicate with `Set`, append 100, and sort ascending.

- [ ] **Step 4: Write a failing IRT test that median-only code cannot satisfy**

Create two rated rows: rating 1000 with score 0 and rating 2000 with score 100. Assert:

```ts
expect(estimateProblemRatings(entries, 0)).toEqual([{ score: 100, rating: 1500 }]);
```

The achiever median would be 2000, while the probability curve balances the success and failure at 1500. Add no-success and all-success cases expecting `{ score: 100, rating: null }`.

- [ ] **Step 5: Run the data test and verify the new IRT assertions RED**

Run the same data test. Expected: threshold tests may pass, while the IRT assertions FAIL until the logistic estimator replaces median calculation.

- [ ] **Step 6: Implement the fixed-slope kenkoooo-style estimator**

For each selected score, gather rated samples and count `problemScores[problemIndex] >= score`. Return `null` for zero samples, zero successes, or all successes. Otherwise binary-search integer `difficulty` in `[-10000, 10000]` until the bounds differ by one:

```ts
const expectedSuccesses = ratings.reduce(
  (sum, rating) => sum + 1 / (1 + 6 ** ((midpoint - rating) / 400)),
  0,
);

if (expectedSuccesses < actualSuccesses) upper = midpoint;
else lower = midpoint;
```

Return `lower` as the integer estimate. Do not round to tens and do not apply a cumulative maximum.

- [ ] **Step 7: Lock the real scoreboard contract**

Replace the old fixed-field actual-scoreboard assertions with these literal results:

```ts
expect(dashboard.problems[0].estimates).toEqual([{ score: 100, rating: 987 }]);
expect(dashboard.problems[8].estimates).toEqual([
  { score: 22, rating: 1903 },
  { score: 38, rating: 1954 },
  { score: 56, rating: 2274 },
  { score: 100, rating: null },
]);
```

Keep the invalid-index tests for both `-1` and `9` and apply them to `selectScoreThresholds` as well.

- [ ] **Step 8: Run the data test and verify GREEN**

Run the same data test. Expected: all contest data tests PASS.

- [ ] **Step 9: Commit the task**

```powershell
git add src/features/contest/model/types.ts src/features/contest/data/buildContestDashboard.ts src/features/contest/data/buildContestDashboard.test.ts
git commit -m "feat: estimate ratings from observed score thresholds"
```

---

### Task 4: Render variable score estimates and explain the model

**Files:**
- Modify: `src/test/fixtures/contestDashboard.ts`
- Modify: `src/features/contest/components/ScoreEstimateGrid.tsx`
- Modify: `src/features/contest/components/ScoreEstimateHelp.tsx`
- Modify: `src/features/contest/components/ContestProblemAnalysis.test.tsx`
- Modify: `src/features/contest/components/ContestDashboard.integration.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `ScoreEstimates` as a readonly array
- Preserves: `RatingText` band coloring and `null -> -`

- [ ] **Step 1: Convert fixture expectations and write failing UI tests**

Use representative arrays in `contestDashboardFixture`:

```ts
estimates: [
  { score: 34, rating: 1277 },
  { score: 100, rating: 1310 },
]
```

and:

```ts
estimates: [
  { score: 22, rating: 1903 },
  { score: 38, rating: 1954 },
  { score: 56, rating: 2274 },
  { score: 100, rating: null },
]
```

Update `ContestProblemAnalysis.test.tsx` to assert `34점`, `100점`, dynamic cell counts of 2 and 4, and band colors for array values. Replace the help assertions with `부분점수`, `사분위`, `100점`, `성공 확률`, `달성`, `미달`, `대회 전 레이팅`, and `-`.

- [ ] **Step 2: Run component and integration tests and verify RED**

Run:

```powershell
npx vitest run src/features/contest/components/ContestProblemAnalysis.test.tsx src/features/contest/components/ContestDashboard.integration.test.tsx
```

Expected: FAIL because the grid still indexes fixed fields and renders percentage labels, and the tooltip still describes medians.

- [ ] **Step 3: Render the estimate array and update help copy**

Map `estimates` directly in `ScoreEstimateGrid`, key each cell by `estimate.score`, render `${estimate.score}점`, and use `estimate.rating` for `RatingText`. Replace `grid-cols-4` with:

```tsx
className="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-1"
```

Update the JSDoc to describe observed thresholds. Rewrite `ScoreEstimateHelp` into two short paragraphs covering the threshold selection and logistic fit, including why `-` appears for one-sided samples.

- [ ] **Step 4: Update README algorithm documentation**

Replace every 25/50/75/100 and median description with the exact partial-score quartile + mandatory 100 selection and the success-probability equation. State that estimates are unofficial and use the supplied pre-contest ratings.

- [ ] **Step 5: Run focused UI tests and verify GREEN**

Run the same focused component/integration command. Expected: all selected tests PASS.

- [ ] **Step 6: Commit the task**

```powershell
git add src/test/fixtures/contestDashboard.ts src/features/contest/components/ScoreEstimateGrid.tsx src/features/contest/components/ScoreEstimateHelp.tsx src/features/contest/components/ContestProblemAnalysis.test.tsx src/features/contest/components/ContestDashboard.integration.test.tsx README.md
git commit -m "feat: render dynamic score rating estimates"
```

---

### Task 5: Full regression and production verification

**Files:**
- Verify: all files changed in Tasks 1-4

**Interfaces:**
- Verifies: parser boundaries, server/client serializability, responsive rendering, type safety, lint, and production compilation

- [ ] **Step 1: Run all unit and integration tests**

Run:

```powershell
npm test
```

Expected: Vitest exits 0 with every test passing.

- [ ] **Step 2: Run static checks**

Run:

```powershell
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands exit 0 with no ESLint errors, TypeScript errors, or whitespace errors.

- [ ] **Step 3: Run the Next.js production build**

Run:

```powershell
npm run build
```

Expected: Next.js 16.3 production compilation, type checking, and route generation exit 0.

- [ ] **Step 4: Inspect the final scope**

Run:

```powershell
git status --short
git diff --stat HEAD~4
git log --oneline -6
```

Expected: only the requested feature files plus the pre-existing user changes are present; no generated `.next` or temporary artifacts are staged.
