import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { items } from "../../../../data/dojstory/items";
import { ItemCatalog } from "./ItemCatalog";

it("filtersEquipmentWithoutHidingNamedMaterials", () => {
  render(<ItemCatalog items={items} />);
  expect(screen.getByRole("link", { name: "수리팩 상세 보기" })).toHaveAttribute("href", "/dojstory/items/repair-pack");
  expect(screen.getByRole("link", { name: "기본 의자 상세 보기" })).toBeInTheDocument();
});
