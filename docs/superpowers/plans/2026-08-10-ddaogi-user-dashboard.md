# Ddaogi User Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete `/users/jtw7913` analytics dashboard from the supplied Markdown and JSON mock data.

**Architecture:** Next.js Server Components read and normalize local data into serializable DTOs. Small Client Component islands own tabs, charts, tooltips, and display-mode toggles; pure domain modules own ratings, tiers, streaks, and distributions.

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript, Tailwind CSS 4, shadcn/ui patterns, Radix UI, Lucide React, Recharts, Vitest, Testing Library

## Global Constraints

- Use React and Next.js; use Tailwind CSS except where a chart library requires a numeric inline style.
- Use Tailwind `dark:` variants for dark-mode-specific visual treatment.
- Follow separation of concerns: local file I/O, parsing, domain calculations, and rendering stay in separate modules.
- Use shadcn/ui patterns and Lucide icons consistently.
- Avoid `any`; restrict `unknown` to raw JSON validation boundaries.
- Component filenames use PascalCase; route segment folders use kebab-case.
- Add JSDoc to exported major functions and components.
- Before completion run ESLint and `tsc --noEmit`.
- Next.js 16 route `params` are promises and must be awaited.
- Keep Server Components as the default; add `"use client"` only at interactive boundaries.

---

## File Map

- `package.json`, `package-lock.json`: runtime and test dependencies and scripts.
- `tsconfig.json`: map `@/*` to `src/*`.
- `vitest.config.mts`, `vitest.setup.ts`: jsdom and Testing Library configuration.
- `src/lib/cn.ts`: shared Tailwind class merger.
- `src/components/ui/*.tsx`: shadcn-style primitives.
- `src/app/layout.tsx`, `src/app/globals.css`, `src/components/AppHeader.tsx`: application shell and design tokens.
- `src/domain/rating.ts`, `src/domain/problemTier.ts`, `src/domain/statistics.ts`, `src/domain/streak.ts`: pure reusable calculations.
- `src/features/user/model/types.ts`: normalized DTO contracts.
- `src/features/user/data/parseUserInfo.ts`: Markdown parsing only.
- `src/features/user/data/buildUserDashboard.ts`: submission and contest normalization only.
- `src/features/user/data/loadUserDashboard.ts`: server-only filesystem access.
- `src/features/user/components/*.tsx`: profile and three analytics tabs.
- `src/app/users/[handle]/page.tsx`: dynamic user route.
- `src/app/users/[handle]/loading.tsx`, `src/app/users/[handle]/error.tsx`, `src/app/not-found.tsx`: route states.
- `src/app/page.tsx`: root redirect.

---

### Task 1: Test Harness, Dependencies, and Shared UI Foundation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Create: `vitest.config.mts`
- Create: `vitest.setup.ts`
- Create: `src/lib/cn.ts`
- Create: `src/lib/cn.test.ts`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/Tooltip.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/AppHeader.tsx`
- Delete: `app/favicon.ico`
- Delete: `app/globals.css`
- Delete: `app/layout.tsx`
- Delete: `app/page.tsx`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string`
- Produces: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge`, `Button`
- Produces: re-exported Radix `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

- [ ] **Step 1: Install the approved UI and test dependencies**

Run:

```powershell
npm install lucide-react recharts @radix-ui/react-tabs @radix-ui/react-tooltip class-variance-authority clsx tailwind-merge
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths
```

Expected: `package.json` contains the runtime packages under `dependencies` and the test packages under `devDependencies`.

- [ ] **Step 2: Add a failing class-merging test and test configuration**

Create `vitest.config.mts`:

```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";

class ResizeObserverStub implements ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

globalThis.ResizeObserver = ResizeObserverStub;
```

Create `src/lib/cn.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Run the focused test and verify the missing module failure**

Run: `npm test -- src/lib/cn.test.ts`

Expected: FAIL because `src/lib/cn.ts` does not exist.

- [ ] **Step 4: Implement the class merger and shadcn-style primitives**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combines conditional class names and resolves conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Implement each primitive with `React.ComponentProps` passthrough, `forwardRef` where Radix requires it, neutral slate defaults, visible focus rings, and `dark:` variants. `Button` uses `cva` variants `default`, `outline`, `ghost`, and sizes `default`, `sm`, `icon`. `Badge` uses variants `default`, `outline`, and `muted`.

The `Card` root contract is:

```tsx
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Surface used to group one analytics concept. */
export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Build the global shell and tokens**

Change `tsconfig.json` path mapping to `"@/*": ["./src/*"]`. Keep `@import "tailwindcss"` in `src/app/globals.css`; add semantic CSS variables for background, foreground, card, border, and brand colors plus base `body`, `selection`, and reduced-motion rules.

Set the root metadata and language:

```tsx
export const metadata: Metadata = {
  title: { default: "따오기", template: "%s · 따오기" },
  description: "DOJ 유저와 대회를 깊이 읽는 서드파티 분석 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50">
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

`AppHeader` contains `Link` elements for `/users/jtw7913` and `/contests/doj-beginner-contest-4`, uses a `Bird` icon, and collapses labels below the `sm` breakpoint.

- [ ] **Step 6: Run foundation verification**

Run:

```powershell
npm test -- src/lib/cn.test.ts
npx tsc --noEmit
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the foundation**

```powershell
git add package.json package-lock.json tsconfig.json vitest.config.mts vitest.setup.ts src/lib src/components/ui src/components/AppHeader.tsx src/app/globals.css src/app/layout.tsx app
git commit -m "chore: establish ddaogi UI foundation"
```

---

### Task 2: Rating, Problem Tier, Quantile, and Streak Domain Rules

**Files:**
- Create: `src/domain/rating.ts`
- Create: `src/domain/rating.test.ts`
- Create: `src/domain/problemTier.ts`
- Create: `src/domain/problemTier.test.ts`
- Create: `src/domain/statistics.ts`
- Create: `src/domain/statistics.test.ts`
- Create: `src/domain/streak.ts`
- Create: `src/domain/streak.test.ts`

**Interfaces:**
- Produces: `RATING_BANDS`, `getRatingBand(rating: number): RatingBand`
- Produces: `parseProblemTier(value?: string): ProblemTier`, `formatProblemTier(tier: ProblemTier): string`
- Produces: `quantile(values: readonly number[], percentile: number): number | null`
- Produces: `calculateSequenceStreak(values: readonly boolean[]): StreakSummary`
- Produces: `calculateDailyStreak(activeDates: readonly string[], asOf: string): StreakSummary`

- [ ] **Step 1: Write rating and problem-tier boundary tests**

```ts
import { describe, expect, it } from "vitest";
import { getRatingBand } from "@/domain/rating";

describe("getRatingBand", () => {
  it.each([
    [1199, "NEWBIE"],
    [1200, "PUPIL"],
    [1399, "PUPIL"],
    [1400, "SPECIALIST"],
    [2399, "INTERNATIONAL_MASTER"],
    [2400, "GRANDMASTER"],
  ] as const)("maps %i to %s", (rating, title) => {
    expect(getRatingBand(rating).title).toBe(title);
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { formatProblemTier, parseProblemTier } from "@/domain/problemTier";

describe("problem tiers", () => {
  it("converts Silver V to S5", () => {
    expect(formatProblemTier(parseProblemTier("Silver V"))).toBe("S5");
  });

  it("falls back to Unrated for a missing value", () => {
    expect(formatProblemTier(parseProblemTier())).toBe("U");
  });
});
```

- [ ] **Step 2: Run the domain tests and verify missing module failures**

Run: `npm test -- src/domain/rating.test.ts src/domain/problemTier.test.ts`

Expected: FAIL because both domain modules are missing.

- [ ] **Step 3: Implement exact rating bands and normalized problem tiers**

Use this rating contract:

```ts
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
```

Populate `RATING_BANDS` with all eight ranges copied from the design and implement `getRatingBand` with `Math.max(0, rating)` and an inclusive upper bound.

Use this tier contract:

```ts
export type ProblemTierGroup =
  | "Unrated"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Ruby";

export interface ProblemTier {
  readonly group: ProblemTierGroup;
  readonly level: 1 | 2 | 3 | 4 | 5 | null;
  readonly label: string;
  readonly shortLabel: string;
  readonly color: string;
}
```

Map Roman numerals `I` through `V` to levels `1` through `5`; `Unrated` and invalid input return the Unrated object.

- [ ] **Step 4: Write failing quantile and streak tests**

```ts
import { describe, expect, it } from "vitest";
import { quantile } from "@/domain/statistics";

describe("quantile", () => {
  it("uses linear interpolation and ignores input order", () => {
    expect(quantile([2400, 1200, 1800, 1400], 0.25)).toBe(1350);
  });

  it("returns null for an empty collection", () => {
    expect(quantile([], 0.5)).toBeNull();
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { calculateDailyStreak, calculateSequenceStreak } from "@/domain/streak";

describe("streak calculations", () => {
  it("counts consecutive contest indices", () => {
    expect(calculateSequenceStreak([false, true, true, false, true])).toEqual({
      current: 1,
      longest: 2,
    });
  });

  it("counts calendar days ending at the supplied as-of date", () => {
    expect(
      calculateDailyStreak(["2026-08-01", "2026-08-02", "2026-08-04"], "2026-08-04"),
    ).toEqual({ current: 1, longest: 2 });
  });
});
```

- [ ] **Step 5: Implement statistics and streak utilities**

`quantile` validates `percentile` in `[0, 1]`, sorts a copy, and linearly interpolates between surrounding positions. `calculateSequenceStreak` walks once and returns the trailing run as `current`. `calculateDailyStreak` deduplicates ISO dates, sorts them, groups adjacent UTC calendar days, and returns zero current streak when `asOf` is not active.

```ts
export interface StreakSummary {
  readonly current: number;
  readonly longest: number;
}
```

- [ ] **Step 6: Run domain verification and commit**

Run: `npm test -- src/domain`

Expected: all domain tests pass.

```powershell
git add src/domain
git commit -m "feat: add analytics domain rules"
```

---

### Task 3: User Mock-Data Parsing and Dashboard Normalization

**Files:**
- Create: `src/features/user/model/types.ts`
- Create: `src/features/user/data/parseUserInfo.ts`
- Create: `src/features/user/data/parseUserInfo.test.ts`
- Create: `src/features/user/data/buildUserDashboard.ts`
- Create: `src/features/user/data/buildUserDashboard.test.ts`
- Create: `src/features/user/data/loadUserDashboard.ts`
- Add: `data/user_info.md`
- Add: `data/result.json`
- Add: `data/difficulty.json`

**Interfaces:**
- Produces: `parseUserInfo(markdown: string): ParsedUserInfo`
- Produces: `buildUserDashboard(handle: string, user: ParsedUserInfo, resultsInput: unknown, difficultiesInput: unknown): UserDashboardData`
- Produces: `loadUserDashboard(handle: string): Promise<UserDashboardData | null>`
- Produces DTOs consumed by every user component.

- [ ] **Step 1: Define DTOs and write a failing parser contract test**

Define serializable types with strings for dates and plain arrays/objects only. The top-level contract is:

```ts
export interface UserDashboardData {
  readonly profile: UserProfile;
  readonly initialRating: number;
  readonly ratingHistory: readonly ContestParticipation[];
  readonly contestStreak: ContestStreakData;
  readonly problems: readonly ProblemSummary[];
  readonly problemSolveStreak: DailyActivityData;
  readonly difficultyGroups: readonly DistributionItem[];
  readonly difficultyDetails: readonly DistributionItem[];
  readonly languages: readonly DistributionItem[];
  readonly totalSubmissions: number;
}

export interface UserProfile {
  readonly handle: string;
  readonly currentRating: number;
  readonly maxRating: number;
  readonly ratingRank: number;
  readonly ratingPercentile: number;
  readonly title: RatingTitle;
  readonly titleColor: string;
  readonly solvedCount: number;
  readonly podiumCount: number;
  readonly firstFullCount: number;
}

export interface ContestParticipation {
  readonly date: string;
  readonly name: string;
  readonly rank: number;
  readonly performanceRating: number | null;
  readonly ratingDiff: number | null;
  readonly ratingAfter: number;
  readonly rated: boolean;
  readonly tierBefore: RatingTitle;
  readonly tierAfter: RatingTitle;
}

export interface ContestCalendarEntry {
  readonly index: number;
  readonly date: string;
  readonly name: string;
  readonly participated: boolean;
}

export interface ContestStreakData extends StreakSummary {
  readonly entries: readonly ContestCalendarEntry[];
}

export interface Submission {
  readonly language: string;
  readonly submittedAt: string;
  readonly score: number;
  readonly maxScore: number;
}

export interface ProblemSummary {
  readonly id: string;
  readonly title: string;
  readonly tier: ProblemTier;
  readonly bestScore: number;
  readonly maxScore: number;
  readonly solved: boolean;
  readonly firstFullDate: string | null;
  readonly submissions: readonly Submission[];
}

export interface DailyActivityPoint {
  readonly date: string;
  readonly count: number;
}

export interface DailyActivityData extends StreakSummary {
  readonly asOf: string;
  readonly days: readonly DailyActivityPoint[];
}

export interface DistributionItem {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly count: number;
  readonly percentage: number;
  readonly color: string;
  readonly totalAvailable: number | null;
}
```

Write `parseUserInfo.test.ts` using the actual fixture:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseUserInfo } from "@/features/user/data/parseUserInfo";

const markdown = readFileSync(resolve(process.cwd(), "data/user_info.md"), "utf8");

describe("parseUserInfo", () => {
  it("parses the jtw7913 profile and both contest tables", () => {
    const result = parseUserInfo(markdown);
    expect(result.profile).toMatchObject({
      currentRating: 1429,
      maxRating: 1429,
      ratingRank: 89,
      ratingPercentile: 31.3,
      podiumCount: 0,
      firstFullCount: 0,
    });
    expect(result.participations).toHaveLength(8);
    expect(result.contestCalendar).toHaveLength(22);
  });
});
```

- [ ] **Step 2: Run the parser test and verify failure**

Run: `npm test -- src/features/user/data/parseUserInfo.test.ts`

Expected: FAIL because the parser module is missing.

- [ ] **Step 3: Implement the Markdown parser**

Split Markdown into lines and use explicit section headings. Parse table rows only when a line starts and ends with `|`; reject a missing expected header with an error naming `user_info.md`.

Use these signatures:

```ts
export interface ParsedUserInfo {
  readonly profile: Omit<UserProfile, "handle" | "title" | "titleColor" | "solvedCount">;
  readonly initialRating: number;
  readonly participations: readonly ParsedParticipation[];
  readonly contestCalendar: readonly ContestCalendarEntry[];
}

/** Parses the stable mock Markdown schema into typed user records. */
export function parseUserInfo(markdown: string): ParsedUserInfo;
```

Convert Korean date tokens to `YYYY-MM-DD` without using the host timezone. Preserve contest names verbatim. Treat `-` performance and diff as `null`, and exclude the initial-rating row from `participations` while retaining its `+1200` value as `initialRating`.

- [ ] **Step 4: Write a failing dashboard-normalization test**

```ts
import difficulties from "../../../../data/difficulty.json";
import results from "../../../../data/result.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildUserDashboard } from "@/features/user/data/buildUserDashboard";
import { parseUserInfo } from "@/features/user/data/parseUserInfo";

describe("buildUserDashboard", () => {
  it("derives all user analytics from the supplied mock files", () => {
    const markdown = readFileSync(resolve(process.cwd(), "data/user_info.md"), "utf8");
    const dashboard = buildUserDashboard(
      "jtw7913",
      parseUserInfo(markdown),
      results,
      difficulties,
    );

    expect(dashboard.profile.solvedCount).toBe(90);
    expect(dashboard.problems.filter((problem) => !problem.solved)).toHaveLength(5);
    expect(dashboard.totalSubmissions).toBe(215);
    expect(dashboard.languages.map((item) => item.count).reduce((a, b) => a + b, 0)).toBe(215);
    expect(dashboard.ratingHistory.at(-1)?.ratingAfter).toBe(1429);
  });
});
```

- [ ] **Step 5: Implement normalization and the server-only loader**

Validate each raw submission using a type guard at the JSON boundary, calculate each problem's best score and first full-score date, and use `Unrated` for missing difficulty entries. Build rating history by starting at 1200 and applying only numeric diffs. Build distributions with deterministic display order.

Implement the loader:

```ts
import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildUserDashboard } from "./buildUserDashboard";
import { parseUserInfo } from "./parseUserInfo";

/** Loads the only supported mock user and returns null for unknown handles. */
export async function loadUserDashboard(handle: string): Promise<UserDashboardData | null> {
  if (handle !== "jtw7913") return null;

  const [markdown, resultsText, difficultyText] = await Promise.all([
    readFile(resolve(process.cwd(), "data/user_info.md"), "utf8"),
    readFile(resolve(process.cwd(), "data/result.json"), "utf8"),
    readFile(resolve(process.cwd(), "data/difficulty.json"), "utf8"),
  ]);

  const resultsInput: unknown = JSON.parse(resultsText);
  const difficultiesInput: unknown = JSON.parse(difficultyText);

  return buildUserDashboard(
    handle,
    parseUserInfo(markdown),
    resultsInput,
    difficultiesInput,
  );
}
```

- [ ] **Step 6: Run data tests and commit**

Run: `npm test -- src/features/user/data`

Expected: parser and normalization tests pass with 90 solved problems, 5 partial problems, and 215 submissions.

```powershell
git add data/user_info.md data/result.json data/difficulty.json src/features/user/model src/features/user/data
git commit -m "feat: normalize user analytics data"
```

---

### Task 4: Dynamic User Route and Profile Hero

**Files:**
- Create: `src/features/user/components/UserProfileHero.tsx`
- Create: `src/features/user/components/UserProfileHero.test.tsx`
- Create: `src/app/users/[handle]/page.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `UserProfile`, `loadUserDashboard(handle)`
- Produces: `UserProfileHero({ profile }: { profile: UserProfile }): ReactNode`
- Produces: `/users/jtw7913`, root redirect, and unsupported-handle 404 behavior.

- [ ] **Step 1: Write a failing profile hero test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";

describe("UserProfileHero", () => {
  it("renders the supplied profile metrics and image fallbacks", () => {
    render(
      <UserProfileHero
        profile={{
          handle: "jtw7913",
          currentRating: 1429,
          maxRating: 1429,
          ratingRank: 89,
          ratingPercentile: 31.3,
          title: "SPECIALIST",
          titleColor: "rgb(20, 184, 166)",
          solvedCount: 90,
          podiumCount: 0,
          firstFullCount: 0,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "jtw7913" })).toBeInTheDocument();
    expect(screen.getByText("SPECIALIST")).toBeInTheDocument();
    expect(screen.getByLabelText("jtw7913 프로필 이미지 대체 표시")).toBeInTheDocument();
    expect(screen.getByLabelText("jtw7913 장착 플랜카드 대체 표시")).toBeInTheDocument();
    expect(screen.getByText("89등 · top 31.3%")).toBeInTheDocument();
    expect(screen.getByText("현재 1,429")).toBeInTheDocument();
    expect(screen.getByText("최고 1,429")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/user/components/UserProfileHero.test.tsx`

Expected: FAIL because `UserProfileHero` is missing.

- [ ] **Step 3: Implement the responsive profile hero**

Use a decorative CSS gradient with `aria-hidden="true"`, a circular initials fallback with an accessible label, and four statistic cells for current rating, max rating, ranking, and solved count. Apply `profile.titleColor` only to the title and rating text because it is a chart-driven dynamic color that Tailwind cannot statically enumerate.

```tsx
/** Presents the user identity and headline analytics. */
export function UserProfileHero({ profile }: { profile: UserProfile }) {
  return (
    <Card className="overflow-hidden">
      <div role="img" aria-label={`${profile.handle} 장착 플랜카드 대체 표시`} className="h-32 bg-gradient-to-br from-orange-300 via-amber-100 to-teal-200 dark:from-orange-950 dark:via-slate-900 dark:to-teal-950" />
      <div className="grid gap-6 px-5 pb-6 sm:px-8 lg:grid-cols-[auto_1fr]">
        <div aria-label={`${profile.handle} 프로필 이미지 대체 표시`} className="-mt-12 grid size-24 place-items-center rounded-3xl border-4 border-white bg-slate-900 text-2xl font-black text-white dark:border-slate-950">
          JT
        </div>
        <div className="pt-1 lg:pt-5">
          <h1 className="text-3xl font-black tracking-tight">{profile.handle}</h1>
          <p style={{ color: profile.titleColor }} className="font-bold">{profile.title}</p>
          <p>{profile.ratingRank}등 · top {profile.ratingPercentile}%</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><dt className="sr-only">현재 레이팅</dt><dd>현재 {profile.currentRating.toLocaleString("ko-KR")}</dd></div>
            <div><dt className="sr-only">최고 레이팅</dt><dd>최고 {profile.maxRating.toLocaleString("ko-KR")}</dd></div>
            <div><dt className="sr-only">레이팅 랭킹</dt><dd>{profile.ratingRank}등</dd></div>
            <div><dt className="sr-only">만점 문제 수</dt><dd>{profile.solvedCount}문제</dd></div>
          </dl>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Implement the dynamic route and root redirect**

```tsx
import { notFound } from "next/navigation";
import { loadUserDashboard } from "@/features/user/data/loadUserDashboard";

export default async function UserPage(props: PageProps<"/users/[handle]">) {
  const { handle } = await props.params;
  const dashboard = await loadUserDashboard(handle);
  if (!dashboard) notFound();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <UserProfileHero profile={dashboard.profile} />
    </div>
  );
}
```

Implement `src/app/page.tsx` as a Server Component that calls `redirect("/users/jtw7913")`. Implement a Korean `not-found.tsx` with links to the supported user and contest.

- [ ] **Step 5: Run focused tests, typecheck, and commit**

Run:

```powershell
npm test -- src/features/user/components/UserProfileHero.test.tsx
npx tsc --noEmit
```

Expected: both commands pass; the route code awaits `props.params`.

```powershell
git add src/features/user/components/UserProfileHero.tsx src/features/user/components/UserProfileHero.test.tsx src/app/page.tsx src/app/not-found.tsx 'src/app/users/[handle]/page.tsx'
git commit -m "feat: add user profile route"
```

---

### Task 5: Rating Analytics Tab

**Files:**
- Create: `src/test/fixtures/userDashboard.ts`
- Create: `src/features/user/components/RatingOverview.tsx`
- Create: `src/features/user/components/RatingOverview.test.tsx`
- Create: `src/features/user/components/RatingHistoryChart.tsx`
- Create: `src/features/user/components/ContestHistoryTable.tsx`
- Create: `src/features/user/components/ContestStreak.tsx`

**Interfaces:**
- Consumes: `UserDashboardData`, `ContestParticipation`, `ContestStreakData`
- Produces: `RatingOverview({ dashboard })`
- Produces: a rating/performance chart toggle, detailed tooltip, reverse chronological contest table, and coordinate-compressed streak.

- [ ] **Step 1: Create a serializable dashboard fixture and failing interaction test**

Create `src/test/fixtures/userDashboard.ts` with this deterministic fixture:

```ts
import { parseProblemTier } from "@/domain/problemTier";
import type { UserDashboardData } from "@/features/user/model/types";

export const userDashboardFixture: UserDashboardData = {
  profile: {
    handle: "jtw7913",
    currentRating: 1429,
    maxRating: 1429,
    ratingRank: 89,
    ratingPercentile: 31.3,
    title: "SPECIALIST",
    titleColor: "rgb(20, 184, 166)",
    solvedCount: 1,
    podiumCount: 0,
    firstFullCount: 0,
  },
  initialRating: 1200,
  ratingHistory: [
    {
      date: "2026-06-07",
      name: "67 Contest",
      rank: 11,
      performanceRating: null,
      ratingDiff: null,
      ratingAfter: 1200,
      rated: false,
      tierBefore: "PUPIL",
      tierAfter: "PUPIL",
    },
    {
      date: "2026-06-14",
      name: "DOJ Contest 3",
      rank: 23,
      performanceRating: 1871,
      ratingDiff: 168,
      ratingAfter: 1368,
      rated: true,
      tierBefore: "PUPIL",
      tierAfter: "PUPIL",
    },
    {
      date: "2026-07-08",
      name: "DOJ Beginner Contest 4",
      rank: 28,
      performanceRating: 1587,
      ratingDiff: 53,
      ratingAfter: 1429,
      rated: true,
      tierBefore: "PUPIL",
      tierAfter: "SPECIALIST",
    },
  ],
  contestStreak: {
    current: 1,
    longest: 2,
    entries: [
      { index: 1, date: "2026-06-07", name: "67 Contest", participated: true },
      { index: 2, date: "2026-06-14", name: "DOJ Contest 3", participated: true },
      { index: 3, date: "2026-07-07", name: "GSHS Contest", participated: false },
      { index: 4, date: "2026-07-08", name: "DOJ Beginner Contest 4", participated: true },
    ],
  },
  problems: [
    {
      id: "342",
      title: "두 수열",
      tier: parseProblemTier("Bronze I"),
      bestScore: 100,
      maxScore: 100,
      solved: true,
      firstFullDate: "2026-07-08",
      submissions: [{ language: "pypy3", submittedAt: "2026-07-08T12:07:22.351Z", score: 100, maxScore: 100 }],
    },
    {
      id: "345",
      title: "직사각형 1",
      tier: parseProblemTier("Gold V"),
      bestScore: 34,
      maxScore: 100,
      solved: false,
      firstFullDate: null,
      submissions: [{ language: "cpp20", submittedAt: "2026-07-08T13:10:54.203Z", score: 34, maxScore: 100 }],
    },
  ],
  problemSolveStreak: {
    asOf: "2026-07-08",
    current: 1,
    longest: 1,
    days: [{ date: "2026-07-08", count: 1 }],
  },
  difficultyGroups: [
    { key: "bronze", label: "Bronze", shortLabel: "B", count: 1, percentage: 100, color: "#b45309", totalAvailable: null },
  ],
  difficultyDetails: [
    { key: "bronze-1", label: "Bronze I", shortLabel: "B1", count: 1, percentage: 100, color: "#b45309", totalAvailable: null },
  ],
  languages: [
    { key: "pypy3", label: "PyPy 3", shortLabel: "PyPy 3", count: 1, percentage: 50, color: "#0d9488", totalAvailable: null },
    { key: "cpp20", label: "C++20", shortLabel: "C++20", count: 1, percentage: 50, color: "#f97316", totalAvailable: null },
  ],
  totalSubmissions: 2,
};
```

Use it in this test:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RatingOverview } from "@/features/user/components/RatingOverview";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("RatingOverview", () => {
  it("switches rating series and exposes all rating fields", async () => {
    const user = userEvent.setup();
    render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("레이팅 변화")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(screen.getByText("퍼포먼스 변화")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "티어 변화" })).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/user/components/RatingOverview.test.tsx`

Expected: FAIL because `RatingOverview` and its children are missing.

- [ ] **Step 3: Implement the rating overview and series state**

Mark `RatingOverview.tsx` and chart files with `"use client"`. Add a local `series` state typed as `"rating" | "performance"` and render two shadcn buttons whose accessible names are `레이팅 보기` and `퍼포먼스 보기`.

```tsx
/** Presents rating history, contest records, and contest-index streaks. */
export function RatingOverview({ dashboard }: { dashboard: UserDashboardData }) {
  const [series, setSeries] = useState<"rating" | "performance">("rating");
  return (
    <div className="space-y-6">
      <div className="flex gap-2" aria-label="차트 지표">
        <Button onClick={() => setSeries("rating")}>레이팅 보기</Button>
        <Button onClick={() => setSeries("performance")}>퍼포먼스 보기</Button>
      </div>
      <RatingHistoryChart initialRating={dashboard.initialRating} history={dashboard.ratingHistory} series={series} />
      <ContestHistoryTable history={dashboard.ratingHistory} />
      <ContestStreak data={dashboard.contestStreak} />
    </div>
  );
}
```

- [ ] **Step 4: Implement the banded Recharts line chart and tooltip**

Use `ResponsiveContainer`, `LineChart`, `ReferenceArea`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, and `Line`. Render one `ReferenceArea` per `RATING_BANDS` intersection with the chart domain. The custom tooltip displays contest name, Korean date, post-contest rating, signed diff, rank, and performance; missing values render `-`.

Add an accessible text summary immediately below the SVG chart so keyboard and screen-reader users can inspect every point without relying on Recharts hover behavior.

- [ ] **Step 5: Implement the contest table and compressed streak**

Sort `ratingHistory` descending for the table. Render tier change only when `tierBefore !== tierAfter`; otherwise render `-`. The streak grid maps every `contestCalendar` entry to a focusable tooltip trigger, uses green for `participated`, and shows `현재 연속` and `최장 연속` from the normalized DTO.

- [ ] **Step 6: Run interaction tests and commit**

Run: `npm test -- src/features/user/components/RatingOverview.test.tsx`

Expected: the series toggle, table headers, unrated dashes, and tab semantics pass.

```powershell
git add src/test/fixtures/userDashboard.ts src/features/user/components/RatingOverview.tsx src/features/user/components/RatingOverview.test.tsx src/features/user/components/RatingHistoryChart.tsx src/features/user/components/ContestHistoryTable.tsx src/features/user/components/ContestStreak.tsx
git commit -m "feat: add user rating analytics"
```

---

### Task 6: Problem Analytics Tab

**Files:**
- Create: `src/features/user/components/ProblemOverview.tsx`
- Create: `src/features/user/components/ProblemOverview.test.tsx`
- Create: `src/features/user/components/ProblemList.tsx`
- Create: `src/features/user/components/ProblemSolveStreak.tsx`
- Create: `src/features/user/components/DifficultyDistribution.tsx`

**Interfaces:**
- Consumes: normalized `problems`, `problemSolveStreak`, `difficultyGroups`, `difficultyDetails`
- Produces: solved/partial lists, solve heatmap, total and rank state, and summary/detail donut toggle.

- [ ] **Step 1: Write a failing problem analytics test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProblemOverview } from "@/features/user/components/ProblemOverview";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("ProblemOverview", () => {
  it("separates solved and partial problems and toggles tier detail", async () => {
    const user = userEvent.setup();
    render(<ProblemOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("만점 문제")).toBeInTheDocument();
    expect(screen.getByText("만점 미달")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /두 수열/ })).toHaveAttribute(
      "href",
      "https://doj.kr/ko/problems/342",
    );
    expect(screen.getByText("34 / 100점")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "자세히 보기" }));
    expect(screen.getByText("Bronze I")).toBeInTheDocument();
    expect(screen.getByText("집계 미제공")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/user/components/ProblemOverview.test.tsx`

Expected: FAIL because the problem analytics components are missing.

- [ ] **Step 3: Implement problem lists and tooltip content**

Render solved and partial problems in separate cards. Each item uses `problem.tier.shortLabel`, a single-line truncated title, and an external anchor with `target="_blank"` and `rel="noreferrer"`. The tooltip always contains the complete title; partial items also expose `${bestScore} / ${maxScore}점` as visible supporting text so the score remains available on touch devices.

- [ ] **Step 4: Implement the solve heatmap**

Render a 7-row CSS grid ordered by week from the earliest first-full date through the latest submission date. Group first-full dates and map counts to five green intensity classes. Each cell has an `aria-label` containing date and solved count. Show current and longest daily streak values next to the heatmap.

- [ ] **Step 5: Implement summary and detailed Recharts donuts**

Keep `detail` boolean state inside `DifficultyDistribution`. Use `PieChart`, `Pie`, `Cell`, and `Tooltip`. Summary order is U/B/S/G/P/D/R; detailed order is Unrated then Bronze V through Ruby I. The legend displays count and percentage computed from the supplied `DistributionItem`. Only render a green `CircleCheck` when `item.totalAvailable !== null && item.count === item.totalAvailable`; the current dataset therefore shows no false completion marker.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- src/features/user/components/ProblemOverview.test.tsx`

Expected: solved/partial sections, external problem URL, score, detail toggle, and missing rank state pass.

```powershell
git add src/features/user/components/ProblemOverview.tsx src/features/user/components/ProblemOverview.test.tsx src/features/user/components/ProblemList.tsx src/features/user/components/ProblemSolveStreak.tsx src/features/user/components/DifficultyDistribution.tsx
git commit -m "feat: add problem analytics"
```

---

### Task 7: Other User Analytics Tab

**Files:**
- Create: `src/features/user/components/UserDashboardTabs.tsx`
- Create: `src/features/user/components/UserDashboardTabs.test.tsx`
- Create: `src/features/user/components/MoreOverview.tsx`
- Create: `src/features/user/components/MoreOverview.test.tsx`
- Create: `src/features/user/components/LanguageDistribution.tsx`
- Modify: `src/app/users/[handle]/page.tsx`

**Interfaces:**
- Consumes: `languages`, `totalSubmissions`, `profile.podiumCount`, `profile.firstFullCount`
- Produces: language donut, four concise statistic cards, and the final three-panel tab composition.

- [ ] **Step 1: Write a failing language and contest-metric test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreOverview } from "@/features/user/components/MoreOverview";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("MoreOverview", () => {
  it("renders language labels, totals, wins, and first full scores", () => {
    render(<MoreOverview dashboard={userDashboardFixture} />);
    expect(screen.getByText("PyPy 3")).toBeInTheDocument();
    expect(screen.getByText("C++20")).toBeInTheDocument();
    expect(screen.getByText("전체 제출")).toBeInTheDocument();
    expect(screen.getByText("대회 1등")).toBeInTheDocument();
    expect(screen.getByText("퍼솔")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/features/user/components/MoreOverview.test.tsx`

Expected: FAIL because `MoreOverview` is missing.

- [ ] **Step 3: Implement language visualization and metrics**

Use a donut plus text legend. Map source labels exactly: `pypy3 → PyPy 3`, `python3 → Python 3`, `cpp17 → C++17`, `cpp20 → C++20`, `custom-json → Custom JSON`. Metric cards show total submissions, distinct language count, podium count, and first-full count. Use `Code2`, `Languages`, `Trophy`, and `Zap` Lucide icons.

- [ ] **Step 4: Write the failing tab-composition test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserDashboardTabs } from "@/features/user/components/UserDashboardTabs";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("UserDashboardTabs", () => {
  it("switches among rating, problem, and other analytics", async () => {
    const user = userEvent.setup();
    render(<UserDashboardTabs dashboard={userDashboardFixture} />);
    expect(screen.getByRole("tab", { name: "레이팅" })).toHaveAttribute("data-state", "active");
    await user.click(screen.getByRole("tab", { name: "문제" }));
    expect(screen.getByText("만점 미달")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "기타 정보" }));
    expect(screen.getByText("PyPy 3")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Implement the tab composition and attach it to the page**

```tsx
"use client";

/** Owns the user analytics tabs and delegates each complete panel. */
export function UserDashboardTabs({ dashboard }: { dashboard: UserDashboardData }) {
  return (
    <Tabs defaultValue="rating" className="space-y-6">
      <TabsList aria-label="유저 분석 범주">
        <TabsTrigger value="rating">레이팅</TabsTrigger>
        <TabsTrigger value="problems">문제</TabsTrigger>
        <TabsTrigger value="more">기타 정보</TabsTrigger>
      </TabsList>
      <TabsContent value="rating"><RatingOverview dashboard={dashboard} /></TabsContent>
      <TabsContent value="problems"><ProblemOverview dashboard={dashboard} /></TabsContent>
      <TabsContent value="more"><MoreOverview dashboard={dashboard} /></TabsContent>
    </Tabs>
  );
}
```

Import `UserDashboardTabs` in `src/app/users/[handle]/page.tsx` and render it immediately after `UserProfileHero`.

- [ ] **Step 6: Run the tests and commit**

Run: `npm test -- src/features/user/components/MoreOverview.test.tsx src/features/user/components/UserDashboardTabs.test.tsx`

Expected: language metrics and all three tab transitions pass.

```powershell
git add src/features/user/components/UserDashboardTabs.tsx src/features/user/components/UserDashboardTabs.test.tsx src/features/user/components/MoreOverview.tsx src/features/user/components/MoreOverview.test.tsx src/features/user/components/LanguageDistribution.tsx 'src/app/users/[handle]/page.tsx'
git commit -m "feat: add additional user analytics"
```

---

### Task 8: Route States, Full Verification, and Visual QA

**Files:**
- Create: `src/app/users/[handle]/loading.tsx`
- Create: `src/app/users/[handle]/error.tsx`
- Create: `src/features/user/components/UserDashboard.integration.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed user dashboard.
- Produces: meaningful loading/error states and requirement-level verification evidence.

- [ ] **Step 1: Write a failing integration assertion for the complete dashboard fixture**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserProfileHero } from "@/features/user/components/UserProfileHero";
import { UserDashboardTabs } from "@/features/user/components/UserDashboardTabs";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

describe("user dashboard composition", () => {
  it("renders identity and the three required analytics categories", () => {
    render(
      <>
        <UserProfileHero profile={userDashboardFixture.profile} />
        <UserDashboardTabs dashboard={userDashboardFixture} />
      </>,
    );
    expect(screen.getByRole("heading", { name: "jtw7913" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "레이팅" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "문제" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "기타 정보" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add route loading and recoverable error UI**

`loading.tsx` renders a profile skeleton and three card skeletons. `error.tsx` is a Client Component with the Next.js 16 `retry: () => void` prop, logs the error in `useEffect`, and offers `다시 시도` and `홈으로` controls.

- [ ] **Step 3: Update README with supported routes and data source**

Document `/users/jtw7913`, `/contests/doj-beginner-contest-4`, the `data/` mock source, and commands `npm run dev`, `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.

- [ ] **Step 4: Run all automated gates**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Expected: every command exits 0. Do not unit-test the async Server Component directly; the Next.js build verifies its route types and server/client boundary.

- [ ] **Step 5: Run the app and perform route and viewport checks**

Run `npm run dev` and inspect:

- `/` redirects to `/users/jtw7913`.
- `/users/jtw7913` has no horizontal page overflow at 390×844, 768×1024, and 1440×1000.
- All three tabs, both chart modes, and the difficulty detail toggle work.
- Rating bands and problem-tier colors remain readable in light and dark color schemes.
- Tooltips do not leave the viewport and all important values also have touch/keyboard-readable text.
- `/users/unknown` renders the Korean 404 page.

- [ ] **Step 6: Commit the completed user dashboard**

```powershell
git add 'src/app/users/[handle]/loading.tsx' 'src/app/users/[handle]/error.tsx' src/features/user/components/UserDashboard.integration.test.tsx README.md
git commit -m "test: verify complete user dashboard"
```
