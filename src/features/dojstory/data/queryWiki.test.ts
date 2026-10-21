import { expect, it } from "vitest";
import { loadDojstoryWiki } from "./loadDojstoryWiki";
import { findWikiItem, findWikiResearch, normalizeWikiQuery, searchWiki } from "./queryWiki";

it("findsRealEntriesAndKeepsUnknownDistinct", async () => {
  const data = await loadDojstoryWiki();
  expect(searchWiki(data, normalizeWikiQuery({ q: "기초가공" }))).toContainEqual(expect.objectContaining({ title: "기초 가공", href: "/dojstory/research/basic-processing" }));
  expect(searchWiki(data, normalizeWikiQuery({ q: " ｄｏｊ GRAND " }))).toContainEqual(expect.objectContaining({ title: "DOJ Grand Contest 1" }));
  expect(findWikiItem(data, "repair-pack")).toMatchObject({ kind: "minimal", options: { status: "unknown" } });
  expect(findWikiItem(data, "no-such-item")).toBeNull();
  expect(findWikiResearch(data, "no-such-research")).toBeNull();
  expect(searchWiki(data, normalizeWikiQuery({ slot: "chair" })).map((entry) => entry.title)).toEqual(["기본 의자"]);
  expect(searchWiki(data, normalizeWikiQuery({ q: "수리팩", kind: "item" }))).toHaveLength(1);
  expect(searchWiki(data, normalizeWikiQuery({ q: "없는것" }))).toEqual([]);
});

it("normalizesRepeatedAndUnsupportedFilters", () => {
  expect(normalizeWikiQuery({ q: ["첫 값", "나중"], kind: ["research", "item"], slot: ["chair", "doll"] })).toEqual({ q: "첫 값", kind: "research", slot: "chair" });
  expect(normalizeWikiQuery({ kind: "recipe", slot: "weapon" })).toEqual({ q: "", kind: "all", slot: "" });
});
