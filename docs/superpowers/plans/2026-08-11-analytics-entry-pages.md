# Analytics Entry Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the root redirect with an informative landing page and add constrained user-search and 20-item contest-list entry pages that lead to the existing demos.

**Architecture:** Keep all three entry routes as App Router pages and use `next/link` for navigation. Isolate the only stateful behavior in a small user-search Client Component, and isolate contest pagination in a pure catalog helper so the one-item mock catalog is already ready for additional contests.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4, lucide-react, Vitest, React Testing Library

## Global Constraints

- Read the relevant installed guides in `node_modules/next/dist/docs/` before changing Next.js routing code; this plan relies on `01-app/01-getting-started/03-layouts-and-pages.md` and `04-linking-and-navigating.md`.
- Use Tailwind CSS for styling and existing `Card`/`Button`-style visual conventions.
- Use `lucide-react` icons and preserve dark-mode behavior through `dark:` utilities.
- Keep concerns separated and new component filenames in PascalCase.
- Add JSDoc to major functions and components.
- Do not add `any` or `unknown` types.
- Preserve the existing `/users/jtw7913` and `/contests/doj-beginner-contest-4` detail behavior.
- Do not modify or stage the user's existing changes in `src/features/user/components/UserProfileHero.tsx`, `.superpowers/sdd/2026-08-10-ddaogi-user-dashboard/task-3-report.md`, `data/readme.md`, or `docs/requirements.md`.
- The exact disclosure timestamp is `2026.08.11 오전 2시`.
- The contest page size is exactly `20`.

---

## File Structure

- Modify `src/app/page.tsx`: render the landing page instead of redirecting.
- Create `src/app/page.test.tsx`: verify landing copy, disclosure, and direct demo links.
- Modify `src/components/AppHeader.tsx`: route brand and analysis navigation to entry pages.
- Modify `src/components/AppHeader.test.tsx`: verify all three header destinations.
- Create `src/features/user/data/userCatalog.ts`: define the single supported user summary.
- Create `src/features/user/components/UserSearchForm.tsx`: own input validation and navigation.
- Create `src/features/user/components/UserSearchForm.test.tsx`: verify supported and unsupported searches.
- Create `src/features/user/components/SupportedUserCard.tsx`: render the supported demo summary and link.
- Create `src/app/users/page.tsx`: compose the user entry page.
- Create `src/app/users/page.test.tsx`: verify the search region and supported profile card.
- Create `src/features/contest/data/contestCatalog.ts`: define contest summaries and pure 20-item pagination.
- Create `src/features/contest/data/contestCatalog.test.ts`: prove pagination boundaries with more than 20 fixtures.
- Create `src/features/contest/components/ContestList.tsx`: render contest rows and disabled/enabled navigation.
- Create `src/features/contest/components/ContestList.test.tsx`: verify the current one-contest presentation.
- Create `src/app/contests/page.tsx`: parse the optional page query and compose the contest entry page.
- Create `src/app/contests/page.test.tsx`: verify the catalog page heading and detail link.
- Modify `README.md`: document the three new entry routes and replace the root redirect description.

---

### Task 1: Landing Page and Global Navigation

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/page.test.tsx`
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/components/AppHeader.test.tsx`

**Interfaces:**
- Consumes: existing `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`, `next/link`, and lucide icons.
- Produces: `/` landing markup and header links to `/`, `/users`, and `/contests`.

- [ ] **Step 1: Write failing landing and navigation tests**

Create `src/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("introduces the service and discloses its unofficial snapshot data", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "DOJ를 더 깊이 읽는 따오기" })).toBeInTheDocument();
    expect(screen.getByText(/DOJ에서 운영하는 공식 사이트가 아닌/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.08\.11 오전 2시/)).toBeInTheDocument();
    expect(screen.getByText(/실시간 데이터가 아닙니다/)).toBeInTheDocument();
  });

  it("links directly to both detail demos", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /유저 분석 데모 보기/ })).toHaveAttribute(
      "href",
      "/users/jtw7913",
    );
    expect(screen.getByRole("link", { name: /대회 분석 데모 보기/ })).toHaveAttribute(
      "href",
      "/contests/doj-beginner-contest-4",
    );
  });
});
```

Update `src/components/AppHeader.test.tsx` so it expects the brand link to have `href="/"`, the `유저 분석` navigation link to have `href="/users"`, and the `대회 분석` link to have `href="/contests"`.

- [ ] **Step 2: Run the focused tests and confirm the expected failures**

Run:

```bash
npx vitest run src/app/page.test.tsx src/components/AppHeader.test.tsx
```

Expected: the home assertions fail because the page redirects, and header href assertions fail because they still point to detail routes.

- [ ] **Step 3: Implement the landing page and header links**

Replace the redirect in `src/app/page.tsx` with a Server Component that:

```tsx
import { ArrowRight, Bird, CircleAlert, Trophy, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const USER_DEMO_HREF = "/users/jtw7913";
const CONTEST_DEMO_HREF = "/contests/doj-beginner-contest-4";

/** Introduces Ddaogi and routes visitors to the available analytics demos. */
export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <Bird aria-hidden="true" className="size-4" />
            DOJ 서드파티 분석 서비스
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DOJ를 더 깊이 읽는 따오기</h1>
            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              유저의 성장 과정과 대회의 결과를 한눈에 살펴보세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={USER_DEMO_HREF} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
              유저 분석 데모 보기 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href={CONTEST_DEMO_HREF} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900">
              대회 분석 데모 보기 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <CardHeader className="flex-row items-start gap-3">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div className="space-y-1.5">
              <CardTitle>이용 전 확인해 주세요</CardTitle>
              <CardDescription className="text-amber-900 dark:text-amber-200">
                따오기는 DOJ에서 운영하는 공식 사이트가 아닌 유저가 만든 자작 사이트입니다.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-amber-900 dark:text-amber-200">
            데이터 기준은 2026.08.11 오전 2시이며 실시간 데이터가 아닙니다.
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="분석 기능">
        <Card><CardHeader><UserRoundSearch aria-hidden="true" className="size-5 text-blue-600" /><CardTitle>유저 분석</CardTitle><CardDescription>레이팅, 문제 풀이, 대회 기록을 입체적으로 확인합니다.</CardDescription></CardHeader></Card>
        <Card><CardHeader><Trophy aria-hidden="true" className="size-5 text-blue-600" /><CardTitle>대회 분석</CardTitle><CardDescription>참가자 레이팅 분포와 문제별 결과를 비교합니다.</CardDescription></CardHeader></Card>
      </section>
    </div>
  );
}
```

Use semantic headings, visible focus rings, responsive `sm:`/`lg:` layout utilities, and dark-mode color variants consistent with existing cards. Change `AppHeader` so the brand uses `/`, the user navigation uses `/users`, and contest navigation uses `/contests`.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npx vitest run src/app/page.test.tsx src/components/AppHeader.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit only Task 1 files**

```bash
git add src/app/page.tsx src/app/page.test.tsx src/components/AppHeader.tsx src/components/AppHeader.test.tsx
git commit -m "feat: add analytics landing page"
```

---

### Task 2: Supported User Search Entry

**Files:**
- Create: `src/features/user/data/userCatalog.ts`
- Create: `src/features/user/components/UserSearchForm.tsx`
- Create: `src/features/user/components/UserSearchForm.test.tsx`
- Create: `src/features/user/components/SupportedUserCard.tsx`
- Create: `src/app/users/page.tsx`
- Create: `src/app/users/page.test.tsx`

**Interfaces:**
- Produces: `SupportedUserSummary`, `SUPPORTED_USER`, `UserSearchForm`, and `SupportedUserCard`.
- `SupportedUserSummary`: `{ readonly handle: string; readonly href: string; readonly title: string; readonly currentRating: number; readonly solvedCount: number }`.
- `UserSearchForm` accepts no props and navigates only to `SUPPORTED_USER.href`.
- `SupportedUserCard` consumes `{ readonly user: SupportedUserSummary }`.

- [ ] **Step 1: Write failing tests for user search and page composition**

Create `src/features/user/components/UserSearchForm.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserSearchForm } from "@/features/user/components/UserSearchForm";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("UserSearchForm", () => {
  beforeEach(() => pushMock.mockReset());

  it("navigates a normalized supported handle to its detail page", async () => {
    const user = userEvent.setup();
    render(<UserSearchForm />);

    await user.type(screen.getByRole("textbox", { name: "유저 핸들" }), " JTW7913 ");
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(pushMock).toHaveBeenCalledWith("/users/jtw7913");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["", "another-user"])("shows an inline error for unsupported value %j", async (value) => {
    const user = userEvent.setup();
    render(<UserSearchForm />);

    if (value) await user.type(screen.getByRole("textbox", { name: "유저 핸들" }), value);
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("현재는 jtw7913만 검색할 수 있어요.");
  });
});
```

Create `src/app/users/page.test.tsx` asserting that `UsersPage` contains the `유저 분석` heading, the `유저 핸들` textbox, a `jtw7913` heading, `SPECIALIST`, `현재 레이팅 1,429`, `만점 문제 90개`, and a `/users/jtw7913` link named `프로필 분석 보기`.

- [ ] **Step 2: Run the focused tests and confirm missing-module failures**

Run:

```bash
npx vitest run src/features/user/components/UserSearchForm.test.tsx src/app/users/page.test.tsx
```

Expected: FAIL because the new modules do not exist.

- [ ] **Step 3: Add the supported-user catalog and search behavior**

Create `src/features/user/data/userCatalog.ts`:

```ts
export interface SupportedUserSummary {
  readonly handle: string;
  readonly href: string;
  readonly title: string;
  readonly currentRating: number;
  readonly solvedCount: number;
}

/** The only user currently backed by the repository's mock snapshot. */
export const SUPPORTED_USER: SupportedUserSummary = {
  handle: "jtw7913",
  href: "/users/jtw7913",
  title: "SPECIALIST",
  currentRating: 1429,
  solvedCount: 90,
};
```

Create `UserSearchForm.tsx` as a Client Component using `useState`, `FormEvent<HTMLFormElement>`, and `useRouter`. On submit, compare `query.trim().toLowerCase()` with `SUPPORTED_USER.handle`; call `router.push(SUPPORTED_USER.href)` for a match, otherwise set the exact error `현재는 jtw7913만 검색할 수 있어요.`. Connect the error to the input with `aria-invalid` and conditional `aria-describedby`, and render it with `role="alert"`.

- [ ] **Step 4: Add the supported profile card and users page**

Create `SupportedUserCard.tsx` using `Card`, `UserRound`, and `ArrowRight`. Render the summary values with Korean labels and a `Link` named `프로필 분석 보기` to `user.href`.

Create `src/app/users/page.tsx`:

```tsx
import type { Metadata } from "next";
import { SupportedUserCard } from "@/features/user/components/SupportedUserCard";
import { UserSearchForm } from "@/features/user/components/UserSearchForm";
import { SUPPORTED_USER } from "@/features/user/data/userCatalog";

export const metadata: Metadata = { title: "유저 분석" };

/** Provides the supported user lookup and demo profile entry point. */
export default function UsersPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">유저 분석</h1>
        <p className="text-slate-600 dark:text-slate-400">DOJ 핸들로 분석 프로필을 찾아보세요.</p>
      </header>
      <UserSearchForm />
      <SupportedUserCard user={SUPPORTED_USER} />
    </div>
  );
}
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npx vitest run src/features/user/components/UserSearchForm.test.tsx src/app/users/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit only Task 2 files**

```bash
git add src/features/user/data/userCatalog.ts src/features/user/components/UserSearchForm.tsx src/features/user/components/UserSearchForm.test.tsx src/features/user/components/SupportedUserCard.tsx src/app/users/page.tsx src/app/users/page.test.tsx
git commit -m "feat: add supported user search"
```

---

### Task 3: Paginated Contest Catalog Entry

**Files:**
- Create: `src/features/contest/data/contestCatalog.ts`
- Create: `src/features/contest/data/contestCatalog.test.ts`
- Create: `src/features/contest/components/ContestList.tsx`
- Create: `src/features/contest/components/ContestList.test.tsx`
- Create: `src/app/contests/page.tsx`
- Create: `src/app/contests/page.test.tsx`

**Interfaces:**
- Produces: `ContestCatalogItem`, `ContestPage`, `CONTESTS_PER_PAGE`, `CONTEST_CATALOG`, and `paginateContests`.
- `ContestCatalogItem`: `{ readonly slug: string; readonly title: string; readonly href: string; readonly dateLabel: string; readonly participationLabel: string; readonly durationLabel: string }`.
- `paginateContests(items: readonly ContestCatalogItem[], requestedPage: number): ContestPage`.
- `ContestList` consumes `{ readonly page: ContestPage }`.

- [ ] **Step 1: Write failing pagination tests**

Create `src/features/contest/data/contestCatalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { paginateContests, type ContestCatalogItem } from "./contestCatalog";

const contests: ContestCatalogItem[] = Array.from({ length: 21 }, (_, index) => ({
  slug: `contest-${index + 1}`,
  title: `Contest ${index + 1}`,
  href: `/contests/contest-${index + 1}`,
  dateLabel: "2026년 8월 11일",
  participationLabel: "일반",
  durationLabel: "100분",
}));

describe("paginateContests", () => {
  it("returns at most 20 contests and exposes the next page", () => {
    const page = paginateContests(contests, 1);
    expect(page.items).toHaveLength(20);
    expect(page).toMatchObject({ currentPage: 1, totalPages: 2, hasPrevious: false, hasNext: true });
  });

  it("clamps invalid page numbers into the available range", () => {
    expect(paginateContests(contests, 99).currentPage).toBe(2);
    expect(paginateContests(contests, -3).currentPage).toBe(1);
  });
});
```

Create `ContestList.test.tsx` asserting that a page built from `CONTEST_CATALOG` shows `DOJ Beginner Contest 4`, links to `/contests/doj-beginner-contest-4`, reports `1 / 1 페이지`, and has disabled `이전 페이지` and `다음 페이지` buttons.

Create `src/app/contests/page.test.tsx` by awaiting `ContestsPage({ searchParams: Promise.resolve({}) })`, rendering the returned element, and asserting the `대회 분석` heading and the supported detail link.

- [ ] **Step 2: Run focused tests and confirm missing-module failures**

Run:

```bash
npx vitest run src/features/contest/data/contestCatalog.test.ts src/features/contest/components/ContestList.test.tsx src/app/contests/page.test.tsx
```

Expected: FAIL because the catalog, list, and page modules do not exist.

- [ ] **Step 3: Implement the pure contest catalog pagination**

Create `contestCatalog.ts` with the interfaces above, `export const CONTESTS_PER_PAGE = 20`, and this single entry:

```ts
export const CONTEST_CATALOG: readonly ContestCatalogItem[] = [
  {
    slug: "doj-beginner-contest-4",
    title: "DOJ Beginner Contest 4",
    href: "/contests/doj-beginner-contest-4",
    dateLabel: "2026년 7월 8일",
    participationLabel: "일반",
    durationLabel: "100분",
  },
];
```

Implement pagination as:

```ts
/** Returns a bounded 20-item page from a contest catalog. */
export function paginateContests(
  items: readonly ContestCatalogItem[],
  requestedPage: number,
): ContestPage {
  const totalPages = Math.max(1, Math.ceil(items.length / CONTESTS_PER_PAGE));
  const safeRequestedPage = Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1;
  const currentPage = Math.min(Math.max(safeRequestedPage, 1), totalPages);
  const start = (currentPage - 1) * CONTESTS_PER_PAGE;

  return {
    items: items.slice(start, start + CONTESTS_PER_PAGE),
    currentPage,
    totalPages,
    totalItems: items.length,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
```

- [ ] **Step 4: Implement the list and route page**

Create `ContestList.tsx` to render a semantic list of Cards. Each row shows the title, date, participation type, duration, and a detail `Link`. Below the list, render `이전 페이지` and `다음 페이지` as links when enabled and actual disabled `button` elements when unavailable. Show `{currentPage} / {totalPages} 페이지` between them.

Create `src/app/contests/page.tsx` using the Next.js 16 promise-based search params:

```tsx
import type { Metadata } from "next";
import { ContestList } from "@/features/contest/components/ContestList";
import { CONTEST_CATALOG, paginateContests } from "@/features/contest/data/contestCatalog";

export const metadata: Metadata = { title: "대회 분석" };

/** Lists available contest analytics in fixed pages of twenty entries. */
export default async function ContestsPage(props: PageProps<"/contests">) {
  const { page: rawPage } = await props.searchParams;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const requestedPage = pageValue ? Number.parseInt(pageValue, 10) : 1;
  const page = paginateContests(CONTEST_CATALOG, requestedPage);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">대회 분석</h1>
        <p className="text-slate-600 dark:text-slate-400">분석할 DOJ 대회를 선택하세요.</p>
      </header>
      <ContestList page={page} />
    </div>
  );
}
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npx vitest run src/features/contest/data/contestCatalog.test.ts src/features/contest/components/ContestList.test.tsx src/app/contests/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit only Task 3 files**

```bash
git add src/features/contest/data/contestCatalog.ts src/features/contest/data/contestCatalog.test.ts src/features/contest/components/ContestList.tsx src/features/contest/components/ContestList.test.tsx src/app/contests/page.tsx src/app/contests/page.test.tsx
git commit -m "feat: add contest catalog entry page"
```

---

### Task 4: Route Documentation and Full Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed `/`, `/users`, and `/contests` routes.
- Produces: accurate repository route documentation and a fully verified build.

- [ ] **Step 1: Update route documentation**

Replace the README route-state bullets with:

```markdown
- `/`: 따오기 소개, 비공식 사이트 및 데이터 기준 시점 안내, 상세 데모 링크를 제공합니다.
- `/users`: `jtw7913` 전용 검색과 지원 프로필 링크를 제공합니다.
- `/users/jtw7913`: 유저 프로필, 레이팅 이력, 문제 풀이, 추가 통계를 제공합니다.
- `/contests`: 페이지당 20개 구조의 대회 목록을 제공하며 현재 한 개 대회를 지원합니다.
- `/contests/doj-beginner-contest-4`: 대회 개요, rated 참가자 분포, 문제별 분석을 제공합니다.
```

- [ ] **Step 2: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all Vitest suites pass with zero failed tests.

- [ ] **Step 3: Run lint and type checking**

Run:

```bash
npm run lint
npx tsc --noEmit
```

Expected: both commands exit 0 with no errors.

- [ ] **Step 4: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js production build exits 0 and lists `/`, `/users`, `/users/[handle]`, `/contests`, and `/contests/[contestSlug]`.

- [ ] **Step 5: Check whitespace and file scope**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only this feature's README change remains unstaged, while pre-existing user-owned files retain their prior status and are not included in feature commits.

- [ ] **Step 6: Commit README only**

```bash
git add README.md
git commit -m "docs: document analytics entry routes"
```

- [ ] **Step 7: Recheck final commit and worktree ownership**

Run:

```bash
git log --oneline -5
git status --short
```

Expected: the four implementation commits are present after the design/plan commits, and remaining dirty files are only the pre-existing user-owned changes listed in Global Constraints.
