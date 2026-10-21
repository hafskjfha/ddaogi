import { cleanup, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { guides } from "../../../../data/dojstory/guides";
import { GuideContent } from "./GuideContent";

it("rendersEnhancementTablesWithoutCompletingMissingValues", () => {
  render(<GuideContent guide={guides.find((guide) => guide.slug === "starforce")!} />);
  const row = screen.getByRole("rowheader", { name: "10 → 11" }).closest("tr")!;
  for (const value of ["6,798", "55%", "8%"]) expect(within(row).getByText(value)).toBeInTheDocument();
  expect(screen.getByText(/실제 하락 3.6%, 유지 41.4%/)).toBeInTheDocument();
  expect(screen.queryByText("자료 충돌")).not.toBeInTheDocument();
  cleanup();
  render(<GuideContent guide={guides.find((guide) => guide.slug === "potential")!} />);
  const grade = screen.getByRole("table", { name: /장착 효과가 없는 기본값/ });
  for (const value of ["12%", "6%", "2%", "0%"]) expect(within(grade).getByText(value)).toBeInTheDocument();
  expect(screen.getByText(/처음 2줄.*최대 4줄/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "관찰 옵션 15개" })).toBeInTheDocument();
  expect(screen.getByText("프로필 반짝임 +?%")).toBeInTheDocument();
  expect(screen.getByText(/수치 미확인/)).toBeInTheDocument();
  cleanup();
  render(<GuideContent guide={guides.find((guide) => guide.slug === "dlc-dojpower")!} />);
  expect(screen.getAllByText("미확인")).toHaveLength(2);
  expect(screen.getByText(/추정·전언/)).toBeInTheDocument();
});
