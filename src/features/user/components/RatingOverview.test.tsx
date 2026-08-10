import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
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

  it("switches rating series and exposes all rating fields", async () => {
    const user = userEvent.setup();
    render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(screen.getByText("레이팅 변화")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(screen.getByText("퍼포먼스 변화")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "티어 변화" })).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("provides every chart point as an accessible text summary", () => {
    render(<RatingOverview dashboard={userDashboardFixture} />);

    const disclosure = screen.getByText("차트 데이터 자세히 보기");
    expect(disclosure.tagName).toBe("SUMMARY");
    fireEvent.click(disclosure);
    const summary = screen.getByRole("list", { name: "레이팅 변화 상세" });
    expect(within(summary).getByText(/67 Contest/)).toHaveTextContent(
      "67 Contest · 2026년 6월 7일 · 레이팅 1200 · 변동 - · 순위 11위 · 퍼포먼스 -",
    );
    expect(within(summary).getByText(/DOJ Contest 3/)).toHaveTextContent(
      "DOJ Contest 3 · 2026년 6월 14일 · 레이팅 1368 · 변동 +168 · 순위 23위 · 퍼포먼스 1871",
    );
  });

  it("renders rating bands, changes the selected series path, and exposes the chart tooltip", async () => {
    const user = userEvent.setup();
    const { container } = render(<RatingOverview dashboard={userDashboardFixture} />);

    expect(container.querySelectorAll(".recharts-reference-area")).toHaveLength(4);
    const ratingPath = container.querySelector(".recharts-line-curve")?.getAttribute("d");
    expect(ratingPath).toBeTruthy();

    const firstDot = container.querySelector<SVGCircleElement>(".recharts-line-dot");
    expect(firstDot).not.toBeNull();
    fireEvent.mouseMove(firstDot!, {
      clientX: Number(firstDot!.getAttribute("cx")),
      clientY: Number(firstDot!.getAttribute("cy")),
    });
    expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent(
      "67 Contest2026년 6월 7일레이팅1200변동-순위11위퍼포먼스-",
    );

    await user.click(screen.getByRole("button", { name: "퍼포먼스 보기" }));
    expect(container.querySelector(".recharts-line-curve")?.getAttribute("d")).not.toBe(ratingPath);
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
});
