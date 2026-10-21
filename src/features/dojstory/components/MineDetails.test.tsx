import { cleanup, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { workshop } from "../../../../data/dojstory/workshop";
import { MineDetails } from "./MineDetails";

it("normalizesMineExperienceAndKeepsUnknownValues", () => {
  for (const mine of workshop.mines) {
    render(<MineDetails mine={mine} />);
    expect(screen.getByRole("heading", { name: mine.name })).toBeInTheDocument();
    expect(screen.getByText(mine.id === "prism" ? "30분 / 개" : "1시간 / 개")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /광산 레벨업/ });
    expect(within(table).getByText("900 XP")).toBeInTheDocument();
    expect(within(table).getByText("3,600 XP")).toBeInTheDocument();
    const level2 = within(table).getAllByRole("row").find((row) => within(row).queryByRole("rowheader", { name: "2" }))!;
    expect(within(level2).getAllByText("미확인")).toHaveLength(2);
    expect(within(level2).queryByText("0 XP")).not.toBeInTheDocument();
    expect(screen.getByText(/개인 효과 적용 여부 미확인/)).toBeInTheDocument();
    expect(screen.getByText(/수집자의 추정/)).toBeInTheDocument();
    cleanup();
  }
});
