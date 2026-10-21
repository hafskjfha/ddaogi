import type { WikiDataset } from "../model/types";

/** Validates identity, evidence and explicit references without inventing game rules. */
export function validateWikiDataset(data: WikiDataset): string[] {
  const errors: string[] = [];
  const entities = [...data.items, ...data.research, ...data.workshop.mines, ...data.guides];
  const sourceIds = new Set(data.sources.map((source) => source.id));
  const ids = new Set(entities.map((entity) => entity.id));
  const itemIds = new Set(data.items.map((item) => item.id));
  const researchIds = new Set(data.research.map((entry) => entry.id));
  function unique(values: string[], label: string) {
    const seen = new Set<string>();
    for (const value of values) { if (seen.has(value)) errors.push(`duplicate ${label}: ${value}`); seen.add(value); }
  }
  unique(data.sources.map((source) => source.id), "source id");
  unique(entities.map((entity) => entity.id), "id");
  for (const group of [data.items, data.research, data.workshop.mines, data.guides]) unique(group.map((entity) => entity.slug), "slug");
  function reference(id: string, allowed: Set<string>, path: string) { if (!allowed.has(id)) errors.push(`${path}: missing reference ${id}`); }
  function walk(value: unknown, path: string): void {
    if (Array.isArray(value)) { value.forEach((entry, i) => walk(entry, `${path}[${i}]`)); return; }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (typeof record.sourceId === "string") {
      reference(record.sourceId, sourceIds, path);
      if (typeof record.section !== "string" || !record.section.trim()) errors.push(`${path}: missing source section`);
    }
    if ("refs" in record && (!Array.isArray(record.refs) || record.refs.length === 0)) errors.push(`${path}: missing source refs`);
    if ("status" in record) {
      if (!["sourced", "tentative", "unknown", "not-applicable", "conflict"].includes(String(record.status))) errors.push(`${path}: invalid evidence status`);
      if (record.status === "conflict") {
        if (!Array.isArray(record.claims) || record.claims.length < 2) errors.push(`${path}: conflict requires claims`);
      } else if (!("refs" in record)) errors.push(`${path}: missing evidence refs`);
      if (["sourced", "tentative"].includes(String(record.status)) && !("value" in record)) errors.push(`${path}: missing evidence value`);
      if (["unknown", "not-applicable"].includes(String(record.status)) && !record.reason) errors.push(`${path}: missing evidence reason`);
      if (record.status === "tentative" && !record.note) errors.push(`${path}: missing tentative note`);
    }
    for (const [key, child] of Object.entries(record)) {
      if (typeof child === "number" && (!Number.isFinite(child) || (/(tokens|Seconds|quantity|requiredDojpower|requiredXp|Kw)/i.test(`${path}.${key}`) && child < 0))) errors.push(`${path}.${key}: invalid negative cost/time or non-finite number`);
      if (key === "value" && typeof child === "number" && /Percent/.test(path) && (child < 0 || child > 100)) errors.push(`${path}: probability outside 0–100`);
      if (typeof child === "string" && ["itemId", "equipmentId", "outputItemId"].includes(key)) reference(child, itemIds, path);
      if (typeof child === "string" && key === "targetId") reference(child, ids, path);
      if (typeof child === "string" && key === "prerequisiteId") reference(child, researchIds, path);
      if (key === "relatedIds" && Array.isArray(child)) child.forEach((id) => reference(id, ids, path));
      walk(child, `${path}.${key}`);
    }
  }
  for (const entry of data.research) {
    if ("value" in entry.prerequisites) entry.prerequisites.value.forEach((id) => reference(id, researchIds, entry.id));
  }
  walk(data, "wiki");
  return errors;
}
