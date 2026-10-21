import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import WikiHome from "./page";

it("searchesCollectedDataAndDisclosesPartialCoverage", async () => {
  render(await WikiHome({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("heading", { name: "DOJstory 위키" })).toBeInTheDocument();
  expect(screen.getByText(/장비 16개/)).toHaveTextContent(/연구 12개/);
  expect(screen.getByText(/현재 수록분/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /기본 의자/ })).toHaveAttribute("href", "/dojstory/items/basic-chair");
  expect(screen.getByRole("link", { name: /기초 가공/ })).toHaveAttribute("href", "/dojstory/research/basic-processing");
  expect(screen.queryByRole("link", { name: "조합법" })).not.toBeInTheDocument();
  expect(screen.queryByText(/검색 결과 0개/)).not.toBeInTheDocument();
});

it("distinguishesNoSearchResultsFromNoQuery", async () => {
  render(await WikiHome({ searchParams: Promise.resolve({ q: "없는항목xyz" }) }));
  expect(screen.getByText(/검색 결과 0개/)).toBeInTheDocument();
  expect(screen.getByText(/검색 조건에 맞는 항목이 없습니다/)).toBeInTheDocument();
});
