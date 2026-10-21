import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { workshop } from "../../../../data/dojstory/workshop";
import { WorkshopOverview } from "./WorkshopOverview";

it("showsWorkshopFactsWithoutProductionSimulation", () => {
  const { container } = render(<WorkshopOverview workshop={workshop} />);
  expect(container).toHaveTextContent(/최대 100/);
  expect(container).toHaveTextContent(/내구도 20 회복/);
  expect(container).toHaveTextContent(/내구도 0.*제작 시간 2배/);
  expect(screen.getByText("200 kW")).toBeInTheDocument();
  expect(screen.getByText(/태양광 패널 설치당 추가 발전량 미확인/)).toBeInTheDocument();
  expect(screen.getByText(/감속 배율 미확인/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /구리 광산 상세/ })).toHaveAttribute("href", "/dojstory/workshop/mines/copper");
});
