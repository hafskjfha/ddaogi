import { render, screen, cleanup } from "@testing-library/react";
import { expect, it } from "vitest";
import { items } from "../../../../data/dojstory/items";
import { ItemDetails } from "./ItemDetails";

it("showsRealEquipmentAndUnknownFields", () => {
  render(<ItemDetails item={items.find((item) => item.slug === "basic-chair")!} related={[]} />);
  expect(screen.getByText("공방 연구속도 +3%")).toBeInTheDocument();
  expect(screen.getByText("머신 제작 속도 +3%")).toBeInTheDocument();
  expect(screen.queryByText("AI 여부")).not.toBeInTheDocument();
  expect(screen.getByText("토큰 획득량 +n%")).toBeInTheDocument();
  cleanup();
  render(<ItemDetails item={items.find((item) => item.slug === "golden-heart-doll")!} related={[]} />);
  expect(screen.getByText("DOJpower 100 이상")).toBeInTheDocument();
  cleanup();
  render(<ItemDetails item={items.find((item) => item.slug === "doj-grand-contest-1")!} related={[]} />);
  expect(screen.getByText("AI 여부")).toBeInTheDocument();
  expect(screen.getByText("예")).toBeInTheDocument();
  expect(screen.queryByText(/\(true\)/)).not.toBeInTheDocument();
  cleanup();
  render(<ItemDetails item={items.find((item) => item.slug === "sjupc-2026")!} related={[]} />);
  expect(screen.getByText("아니요")).toBeInTheDocument();
  expect(screen.queryByText(/\(false\)/)).not.toBeInTheDocument();
});

it("doesNotInventStatsForNamedEntries", () => {
  render(<ItemDetails item={items.find((item) => item.slug === "repair-pack")!} related={[]} />);
  expect(screen.getByText(/이름만 확보한 항목/)).toBeInTheDocument();
  expect(screen.queryByText("기본 옵션")).not.toBeInTheDocument();
  expect(screen.queryByText("획득 방법")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "공정연구 원문" })).toHaveAttribute("href", "/dojstory/sources/research");
});
