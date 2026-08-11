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
    expect(page).toMatchObject({
      currentPage: 1,
      totalPages: 2,
      hasPrevious: false,
      hasNext: true,
    });
  });

  it("returns the final remaining contest on the second page", () => {
    const page = paginateContests(contests, 2);

    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.slug).toBe("contest-21");
    expect(page).toMatchObject({ currentPage: 2, totalPages: 2, hasPrevious: true, hasNext: false });
  });

  it("clamps invalid page numbers into the available range", () => {
    expect(paginateContests(contests, 99).currentPage).toBe(2);
    expect(paginateContests(contests, -3).currentPage).toBe(1);
  });
});
