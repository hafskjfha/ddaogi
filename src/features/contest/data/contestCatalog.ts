export interface ContestCatalogItem {
  readonly slug: string;
  readonly title: string;
  readonly href: string;
  readonly dateLabel: string;
  readonly participationLabel: string;
  readonly durationLabel: string;
}

export interface ContestPage {
  readonly items: readonly ContestCatalogItem[];
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

export const CONTESTS_PER_PAGE = 20;

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
