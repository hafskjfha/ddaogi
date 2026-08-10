# Ddaogi Contest Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete `/contests/doj-beginner-contest-4` analysis page on top of the verified shared foundation and user dashboard.

**Architecture:** A server-only loader combines the contest Markdown and scoreboard JSON into a serializable contest DTO. Pure functions calculate rated-participant quartiles and monotonic score-threshold rating estimates; presentational components render the header, distribution, and responsive problem analysis.

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript, Tailwind CSS 4, existing shadcn-style components, Lucide React, Vitest, Testing Library

## Global Constraints

- Complete the user-dashboard plan first; this plan consumes its UI primitives, rating bands, tier parser, and quantile helper.
- Use React and Next.js; use Tailwind CSS except where a computed marker position requires a percentage inline style.
- Use Tailwind `dark:` variants for dark-mode-specific visual treatment.
- Follow separation of concerns: local file I/O, parsing, calculations, and rendering stay in separate modules.
- Use the established shadcn/ui patterns and Lucide icons consistently.
- Avoid `any`; restrict `unknown` to raw JSON validation boundaries.
- Component filenames use PascalCase; route segment folders use kebab-case.
- Add JSDoc to exported major functions and components.
- Next.js 16 route `params` are promises and must be awaited.
- Keep the page and static sections as Server Components; use Client Components only for Radix tooltip behavior.
- Before completion run tests, ESLint, `tsc --noEmit`, and the production build.

---

## File Map

- `src/features/contest/model/types.ts`: contest, problem, scoreboard, quartile, and estimate DTOs.
- `src/features/contest/data/parseContestInfo.ts`: Markdown parser only.
- `src/features/contest/data/buildContestDashboard.ts`: scoreboard validation and pure derived calculations.
- `src/features/contest/data/loadContestDashboard.ts`: server-only filesystem loader.
- `src/features/contest/components/ContestHero.tsx`: title, schedule, organizers, rated range, and type help.
- `src/features/contest/components/RatingQuartiles.tsx`: min/Q1/median/Q3/max distribution.
- `src/features/contest/components/ContestProblemAnalysis.tsx`: desktop table and mobile cards.
- `src/app/contests/[contestSlug]/page.tsx`: dynamic contest route.
- `src/app/contests/[contestSlug]/loading.tsx`, `src/app/contests/[contestSlug]/error.tsx`: route states.
- `data/contest_info.md`, `data/contest_score_board.json`: committed source fixtures.

---

### Task 1: Contest Parsing and Analytics Calculations

**Files:**
- Create: `src/features/contest/model/types.ts`
- Create: `src/features/contest/data/parseContestInfo.ts`
- Create: `src/features/contest/data/parseContestInfo.test.ts`
- Create: `src/features/contest/data/buildContestDashboard.ts`
- Create: `src/features/contest/data/buildContestDashboard.test.ts`
- Create: `src/features/contest/data/loadContestDashboard.ts`
- Add: `data/contest_info.md`
- Add: `data/contest_score_board.json`

**Interfaces:**
- Consumes: `parseProblemTier`, `quantile`, `getRatingBand`
- Produces: `parseContestInfo(markdown: string): ParsedContestInfo`
- Produces: `calculateRatingDistribution(entries: readonly ScoreboardEntry[]): RatingDistribution`
- Produces: `estimateProblemRatings(entries: readonly ScoreboardEntry[], problemIndex: number): ScoreEstimates`
- Produces: `buildContestDashboard(parsed: ParsedContestInfo, scoreboard: ScoreboardInput): ContestDashboardData`
- Produces: `loadContestDashboard(slug: string): Promise<ContestDashboardData | null>`

- [ ] **Step 1: Define DTOs and write a failing Markdown parser test**

Use this top-level contract:

```ts
export interface ContestDashboardData {
  readonly contest: ContestSummary;
  readonly ratingDistribution: RatingDistribution;
  readonly problems: readonly ContestProblem[];
  readonly ratedParticipantCount: number;
}

export interface ScoreEstimates {
  readonly score25: number | null;
  readonly score50: number | null;
  readonly score75: number | null;
  readonly score100: number | null;
}

export interface ContestSummary {
  readonly slug: string;
  readonly title: string;
  readonly problemOrder: string;
  readonly ratedUpperBound: number;
  readonly director: string;
  readonly setter: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly startLabel: string;
  readonly endLabel: string;
  readonly participationType: ParticipationType;
  readonly durationMinutes: number;
}

export interface RatingDistribution {
  readonly min: number;
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly max: number;
  readonly count: number;
}

export interface ContestProblem {
  readonly index: string;
  readonly title: string;
  readonly tier: ProblemTier;
  readonly firstFullHandle: string | null;
  readonly firstFullTime: string | null;
  readonly estimates: ScoreEstimates;
}

export interface ScoreboardEntry {
  readonly rank: number;
  readonly nickname: string;
  readonly problemScores: readonly number[];
  readonly totalScore: number;
  readonly performance: number | null;
  readonly rating: number | null;
}
```

Write the actual-data parser test:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/contest_info.md"), "utf8");

describe("parseContestInfo", () => {
  it("parses the contest metadata and A through I problems", () => {
    const result = parseContestInfo(markdown);
    expect(result.contest).toMatchObject({
      slug: "doj-beginner-contest-4",
      title: "DOJ Beginner Contest 4",
      durationMinutes: 100,
      participationType: "regular",
      ratedUpperBound: 2400,
    });
    expect(result.problems).toHaveLength(9);
    expect(result.problems[0]).toMatchObject({
      index: "A",
      title: "두 수열",
      firstFullHandle: "jkrt",
      firstFullTime: "0m 55s",
    });
    expect(result.problems[8].firstFullHandle).toBeNull();
  });
});
```

- [ ] **Step 2: Run the parser test and verify failure**

Run: `npm test -- src/features/contest/data/parseContestInfo.test.ts`

Expected: FAIL because `parseContestInfo.ts` is missing.

- [ ] **Step 3: Implement the stable contest Markdown parser**

Parse the basic-information list by exact Korean labels and parse problem blocks beginning with `### <letter>, <title>`. Normalize `일반` to `regular` and `window` to `window`. Convert the supplied start and end strings to ISO strings with `+09:00`; preserve the Korean source strings as display labels if conversion fails loudly during tests.

```ts
export type ParticipationType = "regular" | "window";

export interface ParsedContestInfo {
  readonly contest: ContestSummary;
  readonly problems: readonly ParsedContestProblem[];
}

/** Parses DOJ Beginner Contest 4's stable mock Markdown schema. */
export function parseContestInfo(markdown: string): ParsedContestInfo;
```

Reject duplicate problem indices, missing difficulty, missing title, or fewer than nine problems with an error naming `contest_info.md`.

- [ ] **Step 4: Write failing quartile and estimate tests**

```ts
import scoreboard from "../../../../data/contest_score_board.json";
import { describe, expect, it } from "vitest";
import {
  calculateRatingDistribution,
  estimateProblemRatings,
  parseScoreboard,
} from "@/features/contest/data/buildContestDashboard";

describe("contest analytics", () => {
  it("calculates rated participant quartiles from the actual scoreboard", () => {
    const entries = parseScoreboard(scoreboard);
    expect(calculateRatingDistribution(entries)).toMatchObject({
      q1: 1261,
      median: 1452,
      q3: 1815,
      count: 39,
    });
  });

  it("returns monotonic rounded estimates for each score threshold", () => {
    const entries = parseScoreboard(scoreboard);
    const estimates = estimateProblemRatings(entries, 7);
    const numeric = [
      estimates.score25,
      estimates.score50,
      estimates.score75,
      estimates.score100,
    ].filter((value): value is number => value !== null);
    expect(numeric.every((value) => value % 10 === 0)).toBe(true);
    expect(numeric.every((value, index) => index === 0 || value >= numeric[index - 1])).toBe(true);
  });
});
```

- [ ] **Step 5: Implement scoreboard validation, quartiles, and estimates**

At the raw boundary validate `rank`, `nickname`, nine `problem_scores`, `total_score`, `performance`, and optional numeric `rating`. Convert score strings to numbers and `performance: "-"` to `null`.

`calculateRatingDistribution` sorts valid ratings and calls the shared `quantile` at `0`, `0.25`, `0.5`, `0.75`, and `1`, rounding interpolated results to integers.

`estimateProblemRatings` loops thresholds `[25, 50, 75, 100]`, takes the median rating of entries whose score meets the threshold, rounds to the nearest ten, and then applies a left-to-right cumulative maximum. When no rated participant meets a threshold, retain `null` without using it to reset the prior maximum.

- [ ] **Step 6: Implement the server-only contest loader**

```ts
import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildContestDashboard } from "./buildContestDashboard";
import { parseContestInfo } from "./parseContestInfo";

/** Loads the supported mock contest and returns null for unknown slugs. */
export async function loadContestDashboard(slug: string): Promise<ContestDashboardData | null> {
  if (slug !== "doj-beginner-contest-4") return null;

  const [markdown, scoreboardText] = await Promise.all([
    readFile(resolve(process.cwd(), "data/contest_info.md"), "utf8"),
    readFile(resolve(process.cwd(), "data/contest_score_board.json"), "utf8"),
  ]);

  const scoreboardInput: unknown = JSON.parse(scoreboardText);
  return buildContestDashboard(parseContestInfo(markdown), scoreboardInput);
}
```

- [ ] **Step 7: Run data tests and commit**

Run: `npm test -- src/features/contest/data`

Expected: parser, Q1 1261, median 1452, Q3 1815, and monotonic estimate tests pass.

```powershell
git add data/contest_info.md data/contest_score_board.json src/features/contest/model src/features/contest/data
git commit -m "feat: normalize contest analytics data"
```

---

### Task 2: Contest Route, Header, and Rated Distribution

**Files:**
- Create: `src/test/fixtures/contestDashboard.ts`
- Create: `src/features/contest/components/ContestHero.tsx`
- Create: `src/features/contest/components/ContestHero.test.tsx`
- Create: `src/features/contest/components/RatingQuartiles.tsx`
- Create: `src/features/contest/components/RatingQuartiles.test.tsx`
- Create: `src/app/contests/[contestSlug]/page.tsx`

**Interfaces:**
- Consumes: `ContestSummary`, `RatingDistribution`, `loadContestDashboard`
- Produces: complete contest identity, participation-type explanation, organizer list, and rated distribution visualization.

- [ ] **Step 1: Create a contest fixture and failing header/distribution tests**

Create `src/test/fixtures/contestDashboard.ts`:

```ts
import { parseProblemTier } from "@/domain/problemTier";
import type { ContestDashboardData } from "@/features/contest/model/types";

export const contestDashboardFixture: ContestDashboardData = {
  contest: {
    slug: "doj-beginner-contest-4",
    title: "DOJ Beginner Contest 4",
    problemOrder: "난이도순",
    ratedUpperBound: 2400,
    director: "admin",
    setter: "lunarlity",
    startAt: "2026-07-08T21:00:00+09:00",
    endAt: "2026-07-08T22:40:00+09:00",
    startLabel: "2026년 7월 8일 오후 9:00",
    endLabel: "2026년 7월 8일 오후 10:40",
    participationType: "regular",
    durationMinutes: 100,
  },
  ratingDistribution: {
    min: 1200,
    q1: 1261,
    median: 1452,
    q3: 1815,
    max: 2327,
    count: 39,
  },
  problems: [
    {
      index: "A",
      title: "두 수열",
      tier: parseProblemTier("Bronze I"),
      firstFullHandle: "jkrt",
      firstFullTime: "0m 55s",
      estimates: { score25: 1400, score50: 1400, score75: 1410, score100: 1430 },
    },
    {
      index: "I",
      title: "직사각형 2",
      tier: parseProblemTier("Diamond II"),
      firstFullHandle: null,
      firstFullTime: null,
      estimates: { score25: 2100, score50: 2200, score75: null, score100: null },
    },
  ],
  ratedParticipantCount: 39,
};
```

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestHero } from "@/features/contest/components/ContestHero";
import { RatingQuartiles } from "@/features/contest/components/RatingQuartiles";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("contest summary", () => {
  it("shows schedule, rated range, organizers, type, and quartiles", () => {
    render(
      <>
        <ContestHero contest={contestDashboardFixture.contest} />
        <RatingQuartiles distribution={contestDashboardFixture.ratingDistribution} />
      </>,
    );
    expect(screen.getByRole("heading", { name: "DOJ Beginner Contest 4" })).toBeInTheDocument();
    expect(screen.getByText("100분")).toBeInTheDocument();
    expect(screen.getByText("~2400 rated")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByLabelText("일반 참가 방식 설명")).toBeInTheDocument();
    expect(screen.getByText("Q1 1,261")).toBeInTheDocument();
    expect(screen.getByText("중앙값 1,452")).toBeInTheDocument();
    expect(screen.getByText("Q3 1,815")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/contest/components/ContestHero.test.tsx src/features/contest/components/RatingQuartiles.test.tsx`

Expected: FAIL because the components are missing.

- [ ] **Step 3: Implement the contest hero**

Use `CalendarDays`, `Clock3`, `Gauge`, and `Users` icons. Render title, original start/end labels, duration, rated upper bound, problem ordering, and both organizer roles. The participation type badge is wrapped in a shadcn tooltip whose focusable trigger has `aria-label="일반 참가 방식 설명"`; its content explains both regular and window formats from the requirements.

- [ ] **Step 4: Implement the quartile distribution**

Render a semantic ordered list for minimum, Q1, median, Q3, and maximum, plus a visual horizontal rail. Marker position is `(value - min) / (max - min) * 100`; clamp to `[0, 100]`. Apply the dynamic rating color from `getRatingBand(value).color` to marker borders and labels. Include all values in visible text so the visualization does not depend on color or pointer input.

- [ ] **Step 5: Implement the Next.js 16 dynamic page**

```tsx
import { notFound } from "next/navigation";
import { loadContestDashboard } from "@/features/contest/data/loadContestDashboard";

export default async function ContestPage(
  props: PageProps<"/contests/[contestSlug]">,
) {
  const { contestSlug } = await props.params;
  const dashboard = await loadContestDashboard(contestSlug);
  if (!dashboard) notFound();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <ContestHero contest={dashboard.contest} />
      <RatingQuartiles distribution={dashboard.ratingDistribution} />
      <ContestProblemAnalysis problems={dashboard.problems} />
    </div>
  );
}
```

- [ ] **Step 6: Run focused verification and commit**

Run:

```powershell
npm test -- src/features/contest/components/ContestHero.test.tsx src/features/contest/components/RatingQuartiles.test.tsx
npx tsc --noEmit
```

Expected: component tests pass and the page's promised params typechecks.

```powershell
git add src/test/fixtures/contestDashboard.ts src/features/contest/components/ContestHero.tsx src/features/contest/components/ContestHero.test.tsx src/features/contest/components/RatingQuartiles.tsx src/features/contest/components/RatingQuartiles.test.tsx 'src/app/contests/[contestSlug]/page.tsx'
git commit -m "feat: add contest overview"
```

---

### Task 3: Responsive Problem Difficulty, First Full, and Score Estimates

**Files:**
- Create: `src/features/contest/components/ContestProblemAnalysis.tsx`
- Create: `src/features/contest/components/ContestProblemAnalysis.test.tsx`
- Create: `src/features/contest/components/ScoreEstimateGrid.tsx`

**Interfaces:**
- Consumes: `readonly ContestProblem[]`
- Produces: desktop comparison table, mobile cards, tier badges, FF states, and four score-threshold estimates per problem.

- [ ] **Step 1: Write a failing problem-analysis test**

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestProblemAnalysis } from "@/features/contest/components/ContestProblemAnalysis";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("ContestProblemAnalysis", () => {
  it("renders difficulty, first full score, and all estimates", () => {
    render(<ContestProblemAnalysis problems={contestDashboardFixture.problems} />);
    const row = screen.getByRole("row", { name: /A 두 수열/ });
    expect(within(row).getByText("B1")).toBeInTheDocument();
    expect(within(row).getByText("jkrt")).toBeInTheDocument();
    expect(within(row).getByText("0m 55s")).toBeInTheDocument();
    expect(within(row).getByText("25%")).toBeInTheDocument();
    expect(within(row).getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("아직 없음")).toBeInTheDocument();
    expect(screen.getByText(/mock scoreboard에서 계산한 추정치/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/contest/components/ContestProblemAnalysis.test.tsx`

Expected: FAIL because the analysis components are missing.

- [ ] **Step 3: Implement the shared estimate grid**

`ScoreEstimateGrid` accepts `ScoreEstimates` and maps exact labels `25%`, `50%`, `75%`, `100%`. Format numbers with `ko-KR` grouping and `-` for null. Use a four-column grid at all sizes so score thresholds remain aligned.

```tsx
/** Displays estimated pre-contest ratings for the four score thresholds. */
export function ScoreEstimateGrid({ estimates }: { estimates: ScoreEstimates }) {
  const cells = [
    ["25%", estimates.score25],
    ["50%", estimates.score50],
    ["75%", estimates.score75],
    ["100%", estimates.score100],
  ] as const;

  return (
    <dl className="grid grid-cols-4 gap-1">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-slate-100 px-2 py-2 text-center dark:bg-slate-900">
          <dt className="text-[11px] text-slate-500">{label}</dt>
          <dd className="font-mono text-xs font-bold">{value === null ? "-" : value.toLocaleString("ko-KR")}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 4: Implement one responsive comparison structure**

Render one `role="table"` structure. Style the header and rows as aligned CSS grids at `md` and above; below `md`, hide the header visually and style each `role="row"` as a card whose `role="cell"` values include their own small labels. This supplies the desktop comparison table and mobile card presentation without duplicate accessible content. Each row includes index/title, `tier.shortLabel`, first-full handle and time, and `ScoreEstimateGrid`. FF null renders `아직 없음`. Add the visible note `공식 레이팅이 아닌 mock scoreboard에서 계산한 추정치입니다.` above the structure.

Each row uses `aria-label={problem.index + " " + problem.title}` so the test and assistive technologies can locate it consistently.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- src/features/contest/components/ContestProblemAnalysis.test.tsx`

Expected: problem A details, threshold labels, FF-empty state, and estimate disclaimer pass.

```powershell
git add src/features/contest/components/ContestProblemAnalysis.tsx src/features/contest/components/ContestProblemAnalysis.test.tsx src/features/contest/components/ScoreEstimateGrid.tsx
git commit -m "feat: add contest problem analysis"
```

---

### Task 4: Contest Route States and Full Requirement Verification

**Files:**
- Create: `src/app/contests/[contestSlug]/loading.tsx`
- Create: `src/app/contests/[contestSlug]/error.tsx`
- Create: `src/features/contest/components/ContestDashboard.integration.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed contest dashboard.
- Produces: loading/error recovery and full-project completion evidence.

- [ ] **Step 1: Write the complete contest composition test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestHero } from "@/features/contest/components/ContestHero";
import { ContestProblemAnalysis } from "@/features/contest/components/ContestProblemAnalysis";
import { RatingQuartiles } from "@/features/contest/components/RatingQuartiles";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("contest dashboard composition", () => {
  it("renders every required contest analytics section", () => {
    render(
      <>
        <ContestHero contest={contestDashboardFixture.contest} />
        <RatingQuartiles distribution={contestDashboardFixture.ratingDistribution} />
        <ContestProblemAnalysis problems={contestDashboardFixture.problems} />
      </>,
    );
    expect(screen.getByRole("heading", { name: "DOJ Beginner Contest 4" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rated 참가자 분포" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "문제 분석" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add route loading and recoverable error UI**

The loading route renders a contest-title skeleton, one distribution skeleton, and nine problem-row skeletons. The Client Component error route receives `error` and `retry`, logs the error once, and offers `다시 시도` plus a link to `/contests/doj-beginner-contest-4`.

- [ ] **Step 3: Complete the README requirement map**

Add a concise table mapping each required user and contest capability to its route and data file. Document that rating estimates are medians from the supplied scoreboard and are not official DOJ ratings.

- [ ] **Step 4: Run full automated verification**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Expected: every command exits 0; the build emits both dynamic routes without server/client boundary errors.

- [ ] **Step 5: Run visual and route verification**

Run `npm run dev` and inspect:

- `/contests/doj-beginner-contest-4` shows nine problems and 39 rated participants.
- Q1, median, and Q3 are 1,261, 1,452, and 1,815.
- All problem estimates are null or multiples of ten and never decrease from 25% through 100%.
- Problem I shows `아직 없음` for FF.
- At 390×844 the card list is readable without page overflow; at 1440×1000 the comparison table aligns all estimates.
- The participation-type tooltip opens by pointer and keyboard.
- Light and dark schemes preserve rating, tier, and text contrast.
- `/contests/unknown` renders the shared Korean 404 page.

- [ ] **Step 6: Audit every explicit requirement and commit**

Compare `docs/requirements.md` and the approved design against the running pages. Record any missing evidence as unfinished work and fix it before committing.

```powershell
git add 'src/app/contests/[contestSlug]/loading.tsx' 'src/app/contests/[contestSlug]/error.tsx' src/features/contest/components/ContestDashboard.integration.test.tsx README.md
git commit -m "test: verify complete ddaogi analytics"
```
