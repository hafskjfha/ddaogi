# Analytics Entry Card Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the supported SPECIALIST profile use the shared mint rating theme and make both home feature cards link to their analysis index pages.

**Architecture:** Derive the supported user's title and canonical accent from `currentRating` through the existing rating domain, while reusing the contrast-safe `RatingTitleText` classes for readable text and icons. Keep the home page server-rendered and turn each static feature card into a keyboard-focusable `next/link` destination without changing the existing detail-demo links.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4, lucide-react, Vitest, React Testing Library

## Global Constraints

- Read the relevant installed guide in `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` before changing links.
- `SPECIALIST` uses the contrast-safe classes `text-teal-700 dark:text-teal-400`.
- The supported-card canonical accent uses `rgb(20, 184, 166)` derived from `getRatingBand(1429)`.
- `/users` and `/contests` are the new home feature-card destinations.
- `/users/jtw7913` and `/contests/doj-beginner-contest-4` remain the top demo-link destinations.
- Use existing `RatingTitleText`, `RATING_TEXT_CLASSES`, `Card`, `next/link`, and lucide-react patterns instead of duplicating rating mappings or creating a new abstraction.
- Preserve dark-mode focus contrast and use `aria-hidden="true"` on decorative icons.
- Keep new and changed production units type-safe with no `any` or `unknown`; retain JSDoc on major components.
- Do not modify or stage the user's existing changes in `.superpowers/sdd/2026-08-10-ddaogi-user-dashboard/task-3-report.md`, `src/features/user/components/UserProfileHero.tsx`, `src/features/user/components/UserProfileHero.test.tsx`, `data/readme.md`, or `docs/requirements.md`.

---

## File Structure

- Modify `src/features/user/data/userCatalog.ts`: remove the redundant supported-user `title` field.
- Modify `src/features/user/components/SupportedUserCard.tsx`: derive the band, apply mint title/icon/accent styling.
- Create `src/features/user/components/SupportedUserCard.test.tsx`: verify the supported card's domain-derived presentation.
- Modify `src/app/users/page.test.tsx`: retain route-level proof that the derived SPECIALIST title is displayed.
- Modify `src/app/page.tsx`: make the two feature cards link to `/users` and `/contests`.
- Modify `src/app/page.test.tsx`: verify index-card links while preserving detail-demo links.

---

### Task 1: Domain-Derived Supported User Theme

**Files:**
- Modify: `src/features/user/data/userCatalog.ts`
- Modify: `src/features/user/components/SupportedUserCard.tsx`
- Create: `src/features/user/components/SupportedUserCard.test.tsx`
- Modify: `src/app/users/page.test.tsx`

**Interfaces:**
- Consumes: `getRatingBand(rating: number): RatingBand`, `RATING_TEXT_CLASSES`, and `RatingTitleText`.
- Produces: `SupportedUserSummary` with `{ handle, href, currentRating, solvedCount }` and a card whose title/icon/accent derive from `currentRating`.

- [ ] **Step 1: Write the failing supported-card theme test**

Create `src/features/user/components/SupportedUserCard.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportedUserCard } from "@/features/user/components/SupportedUserCard";
import { SUPPORTED_USER } from "@/features/user/data/userCatalog";

describe("SupportedUserCard", () => {
  it("derives the SPECIALIST mint theme from the supported rating", () => {
    const { container } = render(<SupportedUserCard user={SUPPORTED_USER} />);
    const card = container.firstElementChild;
    if (!(card instanceof HTMLElement)) throw new Error("Supported user card is missing");

    expect(screen.getByText("SPECIALIST")).toHaveClass(
      "text-teal-700",
      "dark:text-teal-400",
    );
    expect(screen.getByText("SPECIALIST")).not.toHaveClass(
      "text-blue-700",
      "dark:text-blue-300",
    );

    const icon = card.querySelector("svg");
    expect(icon).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(card).toHaveClass("border-s-4");
    expect(card).toHaveStyle({ borderInlineStartColor: "rgb(20, 184, 166)" });
  });
});
```

Keep the existing `/users` page assertion for visible `SPECIALIST`; add an assertion there that it has `text-teal-700` and `dark:text-teal-400` so route composition also protects the color contract.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
npx vitest run src/features/user/components/SupportedUserCard.test.tsx src/app/users/page.test.tsx
```

Expected: FAIL because the current card uses blue title/icon classes and has no canonical mint start border.

- [ ] **Step 3: Remove the duplicate title field**

Change `SupportedUserSummary` and `SUPPORTED_USER` in `userCatalog.ts` to:

```ts
export interface SupportedUserSummary {
  readonly handle: string;
  readonly href: string;
  readonly currentRating: number;
  readonly solvedCount: number;
}

export const SUPPORTED_USER: SupportedUserSummary = {
  handle: "jtw7913",
  href: "/users/jtw7913",
  currentRating: 1429,
  solvedCount: 90,
};
```

- [ ] **Step 4: Derive and render the shared rating theme**

Update `SupportedUserCard.tsx` to calculate and apply the domain band:

```tsx
import { RATING_TEXT_CLASSES, RatingTitleText } from "@/components/RatingText";
import { getRatingBand } from "@/domain/rating";
import { cn } from "@/lib/cn";

export function SupportedUserCard({ user }: SupportedUserCardProps) {
  const ratingBand = getRatingBand(user.currentRating);

  return (
    <Card
      className="border-s-4"
      style={{ borderInlineStartColor: ratingBand.color }}
    >
      <CardHeader className="flex-row items-start gap-3">
        <UserRound
          aria-hidden="true"
          className={cn(
            "mt-0.5 size-5 shrink-0",
            RATING_TEXT_CLASSES[ratingBand.title],
          )}
        />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{user.handle}</h2>
          <p className="text-sm font-medium">
            <RatingTitleText title={ratingBand.title}>{ratingBand.title}</RatingTitleText>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            현재 이용 가능한 데모 프로필입니다. 현재는 jtw7913만 제공됩니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>현재 레이팅 {user.currentRating.toLocaleString("ko-KR")}</p>
          <p>만점 문제 {user.solvedCount.toLocaleString("ko-KR")}개</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300"
          href={user.href}
        >
          프로필 분석 보기 <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
```

Retain all existing card copy, metrics, and `/users/jtw7913` link exactly; only replace the title/icon/accent source.

- [ ] **Step 5: Run focused tests GREEN and the full suite**

Run:

```bash
npx vitest run src/features/user/components/SupportedUserCard.test.tsx src/app/users/page.test.tsx
npm test
```

Expected: focused tests pass and all project tests pass.

- [ ] **Step 6: Commit only Task 1 files**

```bash
git add src/features/user/data/userCatalog.ts src/features/user/components/SupportedUserCard.tsx src/features/user/components/SupportedUserCard.test.tsx src/app/users/page.test.tsx
git commit -m "fix: use rating theme for supported profile"
```

---

### Task 2: Linked Home Feature Cards and Final Verification

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `next/link`, existing `Card`, and the home page's static feature copy.
- Produces: whole-card links named `유저 분석 페이지로 이동` and `대회 분석 페이지로 이동` targeting `/users` and `/contests`.

- [ ] **Step 1: Write the failing home feature-card link test**

Add to `src/app/page.test.tsx`:

```tsx
it("links the feature cards to their analysis index pages", () => {
  render(<Home />);

  expect(screen.getByRole("link", { name: "유저 분석 페이지로 이동" })).toHaveAttribute(
    "href",
    "/users",
  );
  expect(screen.getByRole("link", { name: "대회 분석 페이지로 이동" })).toHaveAttribute(
    "href",
    "/contests",
  );
});
```

Keep the existing test that asserts the top demo links still target `/users/jtw7913` and `/contests/doj-beginner-contest-4`.

- [ ] **Step 2: Run the home test and confirm RED**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: FAIL because neither feature card is currently a link.

- [ ] **Step 3: Implement whole-card index links**

Add constants:

```ts
const USER_INDEX_HREF = "/users";
const CONTEST_INDEX_HREF = "/contests";
```

Replace the two plain feature cards with this repeated shape, using the matching icon, heading, description, href, and label for each:

```tsx
<Link
  href={USER_INDEX_HREF}
  aria-label="유저 분석 페이지로 이동"
  className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
>
  <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-blue-300 group-hover:shadow-md dark:group-hover:border-blue-800">
    <CardHeader>
      <UserRoundSearch aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
      <h2 className="text-lg font-semibold leading-none tracking-tight">유저 분석</h2>
      <CardDescription>레이팅, 문제 풀이, 대회 기록을 입체적으로 확인합니다.</CardDescription>
    </CardHeader>
  </Card>
</Link>
```

Apply the same structure to the contest card with `CONTEST_INDEX_HREF`, `대회 분석 페이지로 이동`, `Trophy`, and the existing contest copy. Do not alter either top detail-demo Link.

- [ ] **Step 4: Run focused tests GREEN**

Run:

```bash
npx vitest run src/app/page.test.tsx
```

Expected: all home tests pass, including both index links and both detail-demo links.

- [ ] **Step 5: Run full completion verification**

Run:

```bash
npm test
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
git diff --check
git status --short
```

Expected: the 201-test baseline plus the two new supported-card and home-card tests pass; lint, type generation, type checking, build, and whitespace checks exit 0. Git status contains only Task 2 files plus the explicitly preserved user-owned changes from Global Constraints before the Task 2 commit.

- [ ] **Step 6: Commit only Task 2 files**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: link home analysis cards"
```

- [ ] **Step 7: Confirm final ownership and history**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: both feature commits are present; only the pre-existing user-owned changes listed in Global Constraints remain uncommitted.
