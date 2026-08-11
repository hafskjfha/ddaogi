import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { RatingOverview } from "@/features/user/components/RatingOverview";
import { userDashboardFixture } from "@/test/fixtures/userDashboard";

const SharedResizeObserver = globalThis.ResizeObserver;

class ChartResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  disconnect(): void {}
  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: {
            x: 0,
            y: 0,
            width: 800,
            height: 320,
            top: 0,
            right: 800,
            bottom: 320,
            left: 0,
            toJSON: () => ({}),
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this,
    );
  }
  unobserve(): void {}
}

describe("shared ResizeObserver test setup", () => {
  it("does not fabricate dimensions outside responsive chart tests", () => {
    const callback = vi.fn<ResizeObserverCallback>();
    const observer = new ResizeObserver(callback);

    observer.observe(document.createElement("div"));

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("RatingOverview", () => {
  beforeAll(() => {
    globalThis.ResizeObserver = ChartResizeObserver;
  });

  afterAll(() => {
    globalThis.ResizeObserver = SharedResizeObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("switches rating series and exposes all rating fields", async () => {
    const user = userEvent.setup();
    render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("레이팅 변화")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(screen.getByText("퍼포먼스 변화")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "티어 변화" })).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("starts rating history at the initial rating and plots only rated contests", () => {
    render(<RatingOverview dashboard={userDashboardFixture} />);

    const disclosure = screen.getByText("차트 데이터 자세히 보기");
    expect(disclosure.tagName).toBe("SUMMARY");
    fireEvent.click(disclosure);
    const summary = screen.getByRole("list", { name: "레이팅 변화 상세" });
    expect(within(summary).getAllByRole("listitem")).toHaveLength(3);
    expect(within(summary).getByText(/초기 레이팅/)).toHaveTextContent(
      "초기 레이팅 · 날짜 - · 레이팅 1200 · 변동 - · 순위 - · 퍼포먼스 -",
    );
    expect(within(summary).queryByText(/67 Contest/)).not.toBeInTheDocument();
    expect(within(summary).getByText(/DOJ Contest 3/)).toHaveTextContent(
      "DOJ Contest 3 · 2026년 6월 14일 · 레이팅 1368 · 변동 +168 · 순위 23위 · 퍼포먼스 1871",
    );
    const unratedRow = screen.getByRole("row", { name: /2026\.06\.07 67 Contest 11 - 1,200 - -/ });
    expect(unratedRow).toBeInTheDocument();
    expect(within(unratedRow).getAllByText("-")).toHaveLength(3);
  });

  it("renders rating bands, changes the selected series path, and exposes the chart tooltip", async () => {
    const user = userEvent.setup();
    const { container } = render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(container.querySelectorAll(".recharts-reference-area")).toHaveLength(4);
    const ratingPath = container.querySelector(".recharts-line-curve")?.getAttribute("d");
    expect(ratingPath).toBeTruthy();

    expect(container.querySelectorAll(".recharts-line-dot")).toHaveLength(3);
    const firstDot = container.querySelector<SVGCircleElement>(".recharts-line-dot");
    expect(firstDot).not.toBeNull();
    fireEvent.mouseMove(firstDot!, {
      clientX: Number(firstDot!.getAttribute("cx")),
      clientY: Number(firstDot!.getAttribute("cy")),
    });
    expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent(
      "초기 레이팅날짜 -레이팅1,200변동-순위-퍼포먼스-",
    );

    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(container.querySelector(".recharts-line-curve")?.getAttribute("d")).not.toBe(ratingPath);
    expect(container.querySelectorAll(".recharts-line-dot")).toHaveLength(2);

    fireEvent.click(screen.getByText("차트 데이터 자세히 보기"));
    const performanceSummary = screen.getByRole("list", { name: "퍼포먼스 변화 상세" });
    expect(within(performanceSummary).getAllByRole("listitem")).toHaveLength(2);
    expect(within(performanceSummary).queryByText(/67 Contest/)).not.toBeInTheDocument();
    expect(within(performanceSummary).queryByText(/퍼포먼스 -/)).not.toBeInTheDocument();
  });

  it("colors chart and contest rating details by their independent semantics", async () => {
    const dashboard = {
      ...userDashboardFixture,
      ratingHistory: [
        userDashboardFixture.ratingHistory[0],
        {
          ...userDashboardFixture.ratingHistory[2],
          tierBefore: "NEWBIE" as const,
          tierAfter: "SPECIALIST" as const,
        },
        {
          date: "2026-07-15",
          name: "Negative Contest",
          rank: 19,
          performanceRating: 1421,
          ratingDiff: -8,
          ratingAfter: 1421,
          rated: true,
          tierBefore: "EXPERT" as const,
          tierAfter: "SPECIALIST" as const,
        },
      ],
    };
    const { container } = render(<RatingOverview dashboard={dashboard} />);

    const dots = container.querySelectorAll<SVGCircleElement>(".recharts-line-dot");
    fireEvent.mouseMove(dots[1], {
      clientX: Number(dots[1].getAttribute("cx")),
      clientY: Number(dots[1].getAttribute("cy")),
    });
    const tooltip = await screen.findByRole("tooltip", { hidden: true });
    expect(within(tooltip).getByText("1,429")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(within(tooltip).getByText("1,587")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(within(tooltip).getByText("+53")).toHaveClass("text-emerald-700", "dark:text-emerald-400");

    const positiveRow = screen.getByRole("row", { name: /DOJ Beginner Contest 4/ });
    expect(within(positiveRow).getByText("1,587")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(within(positiveRow).getByText("1,429")).toHaveClass("text-teal-700", "dark:text-teal-400");
    expect(within(positiveRow).getByText("+53")).toHaveClass("text-emerald-700", "dark:text-emerald-400");
    expect(within(positiveRow).getByText("NEWBIE")).toHaveClass("text-slate-700", "dark:text-slate-300");
    expect(within(positiveRow).getByText("SPECIALIST")).toHaveClass(
      "text-teal-700",
      "dark:text-teal-400",
    );
    expect(
      within(within(positiveRow).getByRole("cell", { name: "NEWBIE→SPECIALIST" })).getByText("→"),
    ).toHaveClass("text-slate-500", "dark:text-slate-400");

    const negativeRow = screen.getByRole("row", { name: /Negative Contest/ });
    expect(within(negativeRow).getByText("-8")).toHaveClass("text-red-700", "dark:text-red-400");

    const unratedRow = screen.getByRole("row", { name: /67 Contest/ });
    for (const unavailableValue of within(unratedRow).getAllByText("-")) {
      expect(unavailableValue).toHaveClass("text-slate-500", "dark:text-slate-400");
    }
  });

  it("keeps empty and one-rated-event chart domains usable", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <RatingOverview dashboard={{ ...userDashboardFixture, ratingHistory: [] }} />,
    );

    fireEvent.click(screen.getByText("차트 데이터 자세히 보기"));
    expect(
      within(screen.getByRole("list", { name: "레이팅 변화 상세" })).getAllByRole("listitem"),
    ).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(
      within(screen.getByRole("list", { name: "퍼포먼스 변화 상세" })).queryAllByRole(
        "listitem",
      ),
    ).toHaveLength(0);
    expect(container.querySelectorAll(".recharts-line-dot")).toHaveLength(0);

    rerender(
      <RatingOverview
        dashboard={{ ...userDashboardFixture, ratingHistory: [userDashboardFixture.ratingHistory[1]] }}
      />,
    );
    expect(
      within(screen.getByRole("list", { name: "퍼포먼스 변화 상세" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "레이팅 보기" }));
    expect(
      within(screen.getByRole("list", { name: "레이팅 변화 상세" })).getAllByRole("listitem"),
    ).toHaveLength(2);
    expect(container.querySelectorAll(".recharts-line-dot")).toHaveLength(2);
    expect(container.querySelector(".recharts-line-curve")?.getAttribute("d")).toBeTruthy();
  });

  it("lists contests newest first and only displays real tier transitions", () => {
    render(<RatingOverview dashboard={userDashboardFixture} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("DOJ Beginner Contest 4");
    expect(rows[0]).toHaveTextContent("PUPIL → SPECIALIST");
    expect(rows[1]).toHaveTextContent("DOJ Contest 3");
    expect(rows[1]).not.toHaveTextContent("PUPIL → PUPIL");
    expect(rows[2]).toHaveTextContent("67 Contest");
  });

  it("renders one focusable streak cell per contest with normalized streak totals", async () => {
    const user = userEvent.setup();
    render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("현재 연속 1회")).toBeInTheDocument();
    expect(screen.getByText("최장 연속 2회")).toBeInTheDocument();

    const cells = screen.getAllByRole("button", { name: /회차/ });
    expect(cells).toHaveLength(4);
    expect(screen.getByRole("group", { name: "차트 지표" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "대회별 참가 기록" })).toBeInTheDocument();

    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(cells[0]).toHaveFocus();
  });

  it("keeps only the latest contest tooltip open across delayed pointer and focus closes", async () => {
    vi.useFakeTimers();
    const dashboard = {
      ...userDashboardFixture,
      contestStreak: {
        ...userDashboardFixture.contestStreak,
        entries: [
          { index: 1, date: "2026-06-07", name: "DOJ Contest 1", participated: true },
          { index: 2, date: "2026-06-14", name: "DOJ Contest 2", participated: true },
        ],
      },
    };
    render(<RatingOverview dashboard={dashboard} />);

    const firstCell = screen.getByRole("button", { name: /1회차/ });
    const secondCell = screen.getByRole("button", { name: /2회차/ });

    fireEvent.pointerMove(firstCell, { pointerType: "mouse" });
    await act(() => vi.advanceTimersByTimeAsync(150));
    expect(screen.getByText("DOJ Contest 1")).toBeInTheDocument();

    fireEvent.pointerLeave(firstCell, { pointerType: "mouse" });
    fireEvent.pointerMove(document.body, {
      pointerType: "mouse",
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(secondCell, { pointerType: "mouse" });
    await act(() => vi.advanceTimersByTimeAsync(150));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(screen.queryByText("DOJ Contest 1")).not.toBeInTheDocument();
    expect(screen.getByText("DOJ Contest 2")).toBeInTheDocument();

    fireEvent.pointerLeave(secondCell, { pointerType: "mouse" });
    fireEvent.pointerMove(document.body, {
      pointerType: "mouse",
      clientX: 100,
      clientY: 100,
    });
    await act(() => vi.advanceTimersByTimeAsync(300));
    fireEvent.focus(firstCell);
    await act(() => vi.advanceTimersByTimeAsync(150));
    expect(screen.getByText("DOJ Contest 1")).toBeInTheDocument();

    act(() => {
      secondCell.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      firstCell.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: secondCell }),
      );
    });
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(screen.queryByText("DOJ Contest 1")).not.toBeInTheDocument();
    expect(screen.getByText("DOJ Contest 2")).toBeInTheDocument();
  });
});
