import type { Evidence, SourceRef, WikiSource } from "../../src/features/dojstory/model/types";

/** Records a fact in supplied material; this is not independent official verification. */
export function sourced<T>(value: T, refs: SourceRef[], note?: string): Evidence<T> {
  return { status: "sourced", value, refs, ...(note ? { note } : {}) };
}
/** Keeps missing information distinct from a genuine zero, false or empty list. */
export function unknown<T = never>(reason: string, refs: SourceRef[]): Evidence<T> {
  return { status: "unknown", reason, refs };
}
export function refs(sourceId: string, section: string): SourceRef[] { return [{ sourceId, section }]; }
export function tentative<T>(value: T, refs: SourceRef[], note: string): Evidence<T> { return { status: "tentative", value, refs, note }; }

export const sources: WikiSource[] = [
  { id: "equipment", title: "장비 목록", checkedAt: unknown("원문에 확인일 미기재", refs("equipment", "장비 목록")), externalUrls: [] },
  { id: "research", title: "공정연구", checkedAt: sourced("2026-10-22 00:00 KST", refs("research", "확인날짜")), externalUrls: ["https://doj.kr/ko/workshop", "https://doj.kr/ko/doj-story/guide/workshop"] },
  { id: "workshop", title: "공방", checkedAt: sourced("2026-10-22 00:35 KST", refs("workshop", "확인 날짜")), externalUrls: ["https://doj.kr/ko/workshop", "https://doj.kr/ko/doj-story/guide/workshop"] },
  { id: "starforce", title: "스타포스", checkedAt: sourced("2026-10-22 01:21 KST", refs("starforce", "확인 날짜")), externalUrls: ["https://doj.kr/ko/doj-story/guide/starforce", "https://doj.kr/ko/starforce"] },
  { id: "potential", title: "잠재해방", checkedAt: unknown("원문에 확인일 미기재", refs("potential", "잠재해방")), externalUrls: ["https://doj.kr/ko/doj-story/guide/potential", "https://doj.kr/ko/potential"] },
  { id: "dlc", title: "DLC와 dojPower", checkedAt: sourced("2026-10-21 23:00 KST", refs("dlc", "확인날짜")), externalUrls: ["https://doj.kr/ko/dlc", "https://doj.kr/ko/dlc/training", "https://doj.kr/ko/dlc/power/records", "https://doj.kr/ko/dlc/power"] },
  { id: "clarifications", title: "사용자 정정·보완", checkedAt: sourced("2026-10-22 KST", refs("clarifications", "확인일")), externalUrls: [] },
];

export function sourceDate(id: string): Evidence<string> { return sources.find((source) => source.id === id)!.checkedAt; }
