import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const problemLink = within(row).getByRole("link", { name: "두 수열" });
    expect(problemLink).toHaveAttribute("href", contestDashboardFixture.problems[0].href);
    expect(problemLink).toHaveAttribute("target", "_blank");
    expect(problemLink).toHaveAttribute("rel", "noreferrer");
    expect(problemLink).toHaveClass("focus-visible:ring-2");

    const firstFullLink = within(row).getByRole("link", { name: "jkrt" });
    expect(firstFullLink).toHaveAttribute(
      "href",
      contestDashboardFixture.problems[0].firstFull?.href,
    );
    expect(firstFullLink).toHaveAttribute("target", "_blank");
    expect(firstFullLink).toHaveAttribute("rel", "noreferrer");
    expect(firstFullLink).toHaveClass("focus-visible:ring-2");
    expect(within(firstFullLink).getByText("jkrt")).toHaveClass(
      "text-red-700",
      "dark:text-red-400",
    );
    expect(within(row).getByText("0m 55s")).toBeInTheDocument();
    expect(within(row).getByText("25%")).toBeInTheDocument();
    expect(within(row).getByText("50%")).toBeInTheDocument();
    expect(within(row).getByText("75%")).toBeInTheDocument();
    expect(within(row).getByText("100%")).toBeInTheDocument();
    expect(within(row).getAllByText("1,400")).toHaveLength(2);
    expect(within(row).getByText("1,430")).toBeInTheDocument();

    const unansweredRow = screen.getByRole("row", { name: "I 직사각형 2" });
    expect(within(unansweredRow).getByText("D2")).toBeInTheDocument();
    expect(within(unansweredRow).getByRole("link", { name: "직사각형 2" })).toHaveAttribute(
      "href",
      contestDashboardFixture.problems[1].href,
    );
    expect(within(unansweredRow).getByText("없음")).toBeInTheDocument();
    expect(within(unansweredRow).queryByText("아직 없음")).not.toBeInTheDocument();
    expect(within(unansweredRow).getAllByText("-")).toHaveLength(2);
  });

  it("links every supplied problem and present first-full profile safely", () => {
    render(<ContestProblemAnalysis problems={contestDashboardFixture.problems} />);

    for (const problem of contestDashboardFixture.problems) {
      const problemLink = screen.getByRole("link", { name: problem.title });
      expect(problemLink).toHaveAttribute("href", problem.href);
      expect(problemLink).toHaveAttribute("target", "_blank");
      expect(problemLink).toHaveAttribute("rel", "noreferrer");

      if (problem.firstFull) {
        const firstFullLink = screen.getByRole("link", { name: problem.firstFull.handle });
        expect(firstFullLink).toHaveAttribute("href", problem.firstFull.href);
        expect(firstFullLink).toHaveAttribute("target", "_blank");
        expect(firstFullLink).toHaveAttribute("rel", "noreferrer");
      }
    }
  });

  it("colors each estimate from its own rating band", () => {
    const problem = {
      ...contestDashboardFixture.problems[0],
      estimates: { score25: 1260, score50: 2330, score75: null, score100: null },
    };

    render(<ContestProblemAnalysis problems={[problem]} />);

    expect(screen.getByText("1,260")).toHaveClass("text-green-700", "dark:text-green-400");
    expect(screen.getByText("2,330")).toHaveClass("text-red-700", "dark:text-red-400");
  });

  it("explains the exact estimate algorithm by pointer and keyboard", async () => {
    const user = userEvent.setup();
    render(<ContestProblemAnalysis problems={[contestDashboardFixture.problems[0]]} />);

    const trigger = screen.getByRole("button", { name: "예상 레이팅 산출 방식" });

    await user.hover(trigger);
    let tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("점수 이상");
    expect(tooltip).toHaveTextContent("대회 전 레이팅");
    expect(tooltip).toHaveTextContent("중앙값");
    expect(tooltip).toHaveTextContent("10 단위");
    expect(tooltip).toHaveTextContent("감소하지 않도록");

    await user.unhover(trigger);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

    await user.tab();
    expect(trigger).toHaveFocus();
    tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("점수 이상");
  });

  it("keeps long problem metadata available in its single responsive row", () => {
    const longProblem = {
      ...contestDashboardFixture.problems[0],
      index: "Z",
      title: "매우 긴 문제 제목도 작은 화면의 카드와 넓은 비교 표에서 접근 가능해야 합니다",
      firstFull: {
        ...contestDashboardFixture.problems[0].firstFull!,
        handle: "a-very-long-first-full-score-handle-that-must-not-disappear",
      },
      tier: parseProblemTier("Ruby V"),
    };

    render(<ContestProblemAnalysis problems={[longProblem]} />);

    const row = screen.getByRole("row", {
      name: "Z 매우 긴 문제 제목도 작은 화면의 카드와 넓은 비교 표에서 접근 가능해야 합니다",
    });
    expect(within(row).getByText("R5")).toBeInTheDocument();
    expect(within(row).getByText(longProblem.title)).toBeInTheDocument();
    expect(within(row).getByText(longProblem.firstFull.handle)).toBeInTheDocument();
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
    expect(header).toHaveClass("grid", "dark:text-slate-400");
    expect(within(header).getByRole("columnheader", { name: "문제" })).toHaveClass(
      "sr-only",
      "md:not-sr-only",
    );
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
