import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContestProblemAnalysis } from "@/features/contest/components/ContestProblemAnalysis";
import { parseProblemTier } from "@/domain/problemTier";
import { contestDashboardFixture } from "@/test/fixtures/contestDashboard";

describe("ContestProblemAnalysis", () => {
  it("renders each problem as a labeled comparison row with difficulty, first full score, and estimates", () => {
    render(<ContestProblemAnalysis problems={contestDashboardFixture.problems} />);

    expect(screen.getByRole("heading", { name: "문제 분석" })).toBeInTheDocument();
    expect(screen.getByText("공식 레이팅이 아닌 mock scoreboard에서 계산한 추정치입니다.")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "문제별 난이도와 점수 추정치" })).toBeInTheDocument();

    const row = screen.getByRole("row", { name: "A 두 수열" });
    expect(within(row).getByText("B1")).toBeInTheDocument();
    expect(within(row).getByText("jkrt")).toBeInTheDocument();
    expect(within(row).getByText("0m 55s")).toBeInTheDocument();
    expect(within(row).getByText("25%")).toBeInTheDocument();
    expect(within(row).getByText("50%")).toBeInTheDocument();
    expect(within(row).getByText("75%")).toBeInTheDocument();
    expect(within(row).getByText("100%")).toBeInTheDocument();
    expect(within(row).getAllByText("1,400")).toHaveLength(2);
    expect(within(row).getByText("1,430")).toBeInTheDocument();

    const unansweredRow = screen.getByRole("row", { name: "I 직사각형 2" });
    expect(within(unansweredRow).getByText("D2")).toBeInTheDocument();
    expect(within(unansweredRow).getByText("아직 없음")).toBeInTheDocument();
    expect(within(unansweredRow).getAllByText("-")).toHaveLength(2);
  });

  it("keeps long problem metadata available in its single responsive row", () => {
    const longProblem = {
      ...contestDashboardFixture.problems[0],
      index: "Z",
      title: "매우 긴 문제 제목도 작은 화면의 카드와 넓은 비교 표에서 접근 가능해야 합니다",
      firstFullHandle: "a-very-long-first-full-score-handle-that-must-not-disappear",
      tier: parseProblemTier("Ruby V"),
    };

    render(<ContestProblemAnalysis problems={[longProblem]} />);

    const row = screen.getByRole("row", {
      name: "Z 매우 긴 문제 제목도 작은 화면의 카드와 넓은 비교 표에서 접근 가능해야 합니다",
    });
    expect(within(row).getByText("R5")).toBeInTheDocument();
    expect(within(row).getByText(longProblem.title)).toBeInTheDocument();
    expect(within(row).getByText(longProblem.firstFullHandle!)).toBeInTheDocument();
  });

  it("uses fluid desktop tracks and protected mobile content for long values", () => {
    render(<ContestProblemAnalysis problems={contestDashboardFixture.problems} />);

    const table = screen.getByRole("table", { name: "문제별 난이도와 점수 추정치" });
    const [header] = within(table).getAllByRole("row");
    const row = screen.getByRole("row", { name: "A 두 수열" });
    const [problemCell, , firstFullCell, estimateCell] = within(row).getAllByRole("cell");
    const estimates = estimateCell.querySelector("dl");
    if (!estimates) throw new Error("Expected the score estimate grid to be rendered");

    // Catches fixed min-content desktop tracks that overflow at the md breakpoint.
    expect(header).toHaveClass(
      "md:grid-cols-[minmax(0,1.25fr)_minmax(0,.45fr)_minmax(0,.8fr)_minmax(0,1fr)]",
    );
    expect(row).toHaveClass(
      "md:grid-cols-[minmax(0,1.25fr)_minmax(0,.45fr)_minmax(0,.8fr)_minmax(0,1fr)]",
    );

    // Catches loss of the responsive/mobile wrapping and dark-surface protections.
    expect(header).toHaveClass("sr-only", "md:not-sr-only", "md:grid", "md:dark:text-slate-400");
    expect(problemCell).toHaveClass("min-w-0");
    expect(within(problemCell).getByText("문제")).toHaveClass("md:hidden", "dark:text-slate-400");
    expect(within(problemCell).getByText("두 수열")).toHaveClass(
      "min-w-0",
      "break-words",
      "dark:text-slate-50",
    );
    expect(firstFullCell).toHaveClass("min-w-0");
    expect(within(firstFullCell).getByText("jkrt").parentElement).toHaveClass("break-words");
    expect(estimates).toHaveClass("grid", "grid-cols-4");
    expect(Array.from(estimates.children)).toHaveLength(4);
    expect(Array.from(estimates.children)[0]).toHaveClass("min-w-0", "dark:bg-slate-900");
  });

  it("uses static palette badge classes instead of inline colors", () => {
    render(<ContestProblemAnalysis problems={contestDashboardFixture.problems} />);

    const bronzeBadge = screen.getByText("B1");
    const diamondBadge = screen.getByText("D2");

    // Catches a return to runtime style bindings instead of the approved static palette.
    expect(bronzeBadge).toHaveClass("bg-[#ad5600]", "text-white");
    expect(diamondBadge).toHaveClass("bg-[#00b4fc]", "text-slate-950");
    expect(bronzeBadge).not.toHaveAttribute("style");
    expect(diamondBadge).not.toHaveAttribute("style");
  });
});
