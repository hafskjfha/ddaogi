import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { loadWikiSource } from "./loadWikiSource";

it("readsOnlyRegisteredSourcesAsPlainText", async () => {
  expect((await loadWikiSource("equipment"))?.text).toBe(await readFile(resolve("docs/dojstory-data/equipment.md"), "utf8"));
  expect((await loadWikiSource("equipment"))?.checkedAt.status).toBe("unknown");
  expect((await loadWikiSource("clarifications"))?.text).toContain("선행 연구 목록은 모두 필수");
  for (const id of ["not-found", "../equipment", "../../package.json", "__proto__", "constructor", "/etc/passwd"]) expect(await loadWikiSource(id)).toBeNull();
});

it("propagatesSourceReadFailures", async () => {
  const spy = vi.spyOn(process, "cwd").mockReturnValue(resolve("docs", "missing-wiki-fixture-root"));
  try { await expect(loadWikiSource("equipment")).rejects.toThrow(/ENOENT/); }
  finally { spy.mockRestore(); }
});
