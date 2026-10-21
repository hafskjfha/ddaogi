import type { Evidence, RelatedLink, WikiDataset } from "../model/types";

const known = <T>(evidence: Evidence<T>): T | undefined => "value" in evidence ? evidence.value : undefined;

/** Derives both directions from explicit references, never from guessed recipes. */
export function getWikiRelations(data: WikiDataset, id: string): RelatedLink[] {
  const targets = [
    ...data.items.map((entry) => ({ id: entry.id, title: entry.name, href: `/dojstory/items/${entry.slug}` })),
    ...data.research.map((entry) => ({ id: entry.id, title: entry.name, href: `/dojstory/research/${entry.slug}` })),
    ...data.workshop.mines.map((entry) => ({ id: entry.id, title: entry.name, href: `/dojstory/workshop/mines/${entry.slug}` })),
    ...data.guides.map((entry) => ({ id: entry.id, title: entry.title, href: `/dojstory/guides/${entry.slug}` })),
  ];
  if (!targets.some((entry) => entry.id === id)) return [];
  const links: RelatedLink[] = [];
  function add(targetId: string, label: string) {
    const target = targets.find((entry) => entry.id === targetId);
    if (target && targetId !== id && !links.some((entry) => entry.id === targetId && entry.label === label)) links.push({ ...target, label });
  }
  for (const entry of data.research) {
    const prerequisites = known(entry.prerequisites);
    if (entry.id === id) {
      prerequisites?.forEach((targetId) => add(targetId, "필수 선행 연구"));
      known(entry.effects)?.forEach((effect) => { if (effect.targetId) add(effect.targetId, "해금 대상"); });
      known(entry.materials)?.forEach((material) => add(material.itemId, "소비 재료"));
      const access = known(entry.access);
      if (access) add(access.powerOrEquipment.equipmentId, "대체 착용 조건");
    }
    if (prerequisites?.includes(id)) add(entry.id, "후속 연구");
    if (known(entry.effects)?.some((effect) => effect.targetId === id)) add(entry.id, "해금하는 연구");
    if (known(entry.materials)?.some((material) => material.itemId === id)) add(entry.id, "소비하는 연구");
    if (known(entry.access)?.powerOrEquipment.equipmentId === id) add(entry.id, "착용 대체 조건이 있는 연구");
  }
  for (const mine of data.workshop.mines) {
    if (mine.id === id) { add(mine.outputItemId, "채굴 대상"); add(mine.prerequisiteId, "필수 선행 연구"); }
    if (mine.outputItemId === id) add(mine.id, "채굴하는 광산");
  }
  for (const guide of data.guides) {
    if (guide.id === id) guide.relatedIds.forEach((targetId) => add(targetId, "관련 항목"));
    if (guide.relatedIds.includes(id)) add(guide.id, "관련 가이드");
  }
  const item = data.items.find((entry) => entry.id === id);
  if (item?.kind === "equipment") {
    add("guide-starforce", "관련 가이드");
    if (known(item.slot) !== "background") add("guide-potential", "관련 가이드");
  }
  return links.sort((a, b) => a.title.localeCompare(b.title, "ko"));
}
