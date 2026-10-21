import { expect, it } from "vitest";
import { items } from "../../../../data/dojstory/items";
import { loadDojstoryWiki } from "./loadDojstoryWiki";

it("failsForInvalidDatasetRatherThanShowingEmptyCatalog", async () => {
  items.push(items[0]);
  try { await expect(loadDojstoryWiki()).rejects.toThrow(/duplicate.*id/i); }
  finally { items.pop(); }
  expect((await loadDojstoryWiki()).items.filter((item) => item.kind === "equipment")).toHaveLength(16);
});
