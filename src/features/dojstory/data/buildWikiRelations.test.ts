import { expect, it } from "vitest";
import { loadDojstoryWiki } from "./loadDojstoryWiki";
import { getWikiRelations } from "./buildWikiRelations";

it("preservesKnownResearchLinks", async () => {
  const data = await loadDojstoryWiki();
  expect(getWikiRelations(data, "crystal-compression")).toEqual(expect.arrayContaining([
    expect.objectContaining({ href: "/dojstory/research/basic-processing", label: "필수 선행 연구" }),
    expect.objectContaining({ href: "/dojstory/research/aurora-synthesis", label: "후속 연구" }),
    expect.objectContaining({ href: "/dojstory/items/basic-prism", label: "해금 대상" }),
  ]));
  expect(getWikiRelations(data, "basic-science-kit")).toContainEqual(expect.objectContaining({ href: "/dojstory/research/chemical-engineering", label: "소비하는 연구" }));
  expect(getWikiRelations(data, "missing")).toEqual([]);
  expect(getWikiRelations(data, "basic-doll")).toContainEqual(expect.objectContaining({ href: "/dojstory/guides/potential" }));
  expect(getWikiRelations(data, "doj-grand-contest-1").some((link) => link.href.endsWith("/potential"))).toBe(false);
});
