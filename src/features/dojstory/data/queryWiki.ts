import { equipmentSlots, type WikiDataset, type WikiItem, type WikiQuery, type WikiResearch, type WikiSearchResult } from "../model/types";

const normalizeText = (text: string) => text.normalize("NFKC").toLocaleLowerCase("ko").replace(/\s+/g, "");
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Repeated URL filters use their first value; unsupported filters are discarded. */
export function normalizeWikiQuery(raw: Record<string, string | string[] | undefined>): WikiQuery {
  const kind = first(raw.kind);
  const slot = first(raw.slot);
  return { q: first(raw.q), kind: ["item", "research", "guide", "workshop"].includes(kind) ? kind as WikiQuery["kind"] : "all", slot: Object.hasOwn(equipmentSlots, slot) ? slot : "" };
}

/** Searches supplied names and aliases without rewriting canonical identities. */
export function searchWiki(data: WikiDataset, query: WikiQuery): WikiSearchResult[] {
  const term = normalizeText(query.q);
  const results: (WikiSearchResult & { terms: string[]; slot?: string })[] = [
    ...data.items.map((item) => ({ id: item.id, kind: "item" as const, title: item.name, href: `/dojstory/items/${item.slug}`, summary: item.kind === "equipment" && "value" in item.slot ? equipmentSlots[item.slot.value] : "이름만 확보 · 상세 정보 수집 중", terms: item.aliases, slot: "value" in item.slot ? item.slot.value : undefined })),
    ...data.research.map((entry) => ({ id: entry.id, kind: "research" as const, title: entry.name, href: `/dojstory/research/${entry.slug}`, summary: "공정연구 · 제공 자료 수록분", terms: entry.aliases })),
    ...data.guides.map((guide) => ({ id: guide.id, kind: "guide" as const, title: guide.title, href: `/dojstory/guides/${guide.slug}`, summary: guide.summary, terms: [] })),
    { id: "workshop", kind: "workshop", title: "공방", href: "/dojstory/workshop", summary: "머신 · 공정연구 · 발전소 · 광산", terms: [] },
    ...data.workshop.mines.map((mine) => ({ id: mine.id, kind: "workshop" as const, title: mine.name, href: `/dojstory/workshop/mines/${mine.slug}`, summary: "관찰된 광산 정보", terms: mine.aliases })),
  ];
  return results.filter((entry) => (query.kind === "all" || query.kind === entry.kind) && (!query.slot || (entry.kind === "item" && entry.slot === query.slot)) && (!term || [entry.title, entry.summary, ...entry.terms].some((value) => normalizeText(value).includes(term))))
    .sort((a, b) => a.title.localeCompare(b.title, "ko"))
    .map(({ id, kind, title, href, summary }) => ({ id, kind, title, href, summary }));
}

export function findWikiItem(data: WikiDataset, slug: string): WikiItem | null { return data.items.find((item) => item.slug === slug) ?? null; }
export function findWikiResearch(data: WikiDataset, slug: string): WikiResearch | null { return data.research.find((entry) => entry.slug === slug) ?? null; }
