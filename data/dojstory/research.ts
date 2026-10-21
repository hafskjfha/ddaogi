import type { WikiResearch } from "../../src/features/dojstory/model/types";
import { refs, sourced, sourceDate } from "./sources";

const correction = refs("clarifications", "연구 효과와 소비 재료");
/** Transcribes the twelve collected studies, including confirmed empty effects. */
function study(id: string, name: string, aliases: string[], prerequisites: string[], power: number, tokens: number, seconds: number, effects: { text: string; targetId?: string; requiresSeparateRecipe?: boolean }[], kits = false): WikiResearch {
  const original = refs("research", name);
  return {
    id, slug: id, name, aliases, refs: [...original, ...correction], checkedAt: sourceDate("research"),
    prerequisites: sourced(prerequisites, [...original, ...refs("clarifications", "연구 이름과 조건")]),
    access: sourced({ operator: "AND", powerOrEquipment: { operator: "OR", requiredDojpower: power, equipmentId: "proof-of-worth" } }, [...original, ...refs("clarifications", "연구 이름과 조건")]),
    tokens: sourced(tokens, original), materials: sourced(kits ? [{ itemId: "basic-science-kit", quantity: 10 }] : [], kits ? [...original, ...correction] : original),
    durationSeconds: sourced(seconds, original), effects: sourced(effects, [...original, ...correction]),
  };
}

export const research: WikiResearch[] = [
  study("basic-processing", "기초 가공", ["기초가공"], [], 50, 0, 0, [
    { text: "구리 광산 채굴", targetId: "copper" }, { text: "철 광산 채굴", targetId: "iron" }, { text: "프리즘 광산 채굴", targetId: "prism" },
  ]),
  study("crystal-compression", "결정 압축", ["결정압축"], ["basic-processing"], 50, 0, 1800, [{ text: "베이직 프리즘 제작법 해금", targetId: "basic-prism", requiresSeparateRecipe: true }]),
  study("aurora-synthesis", "오로라 합성", [], ["crystal-compression", "optical-separation-1"], 200, 100, 3600, [{ text: "오로라 프리즘 제작법 해금", targetId: "aurora-prism", requiresSeparateRecipe: true }]),
  study("optical-separation-1", "광학 분리 I", ["광학분리 I"], ["basic-processing"], 100, 0, 1800, []),
  study("recycling", "재활용 기술", [], [], 200, 10, 60, [{ text: "아이템 파쇄 시 해당 아이템에 설정된 재료 회수 확률과 수량에 따라 재료를 얻습니다." }]),
  study("metal-extraction", "금속 추출", [], ["recycling"], 200, 50, 3600, [{ text: "철 주괴 제작가능", targetId: "iron-ingot" }]),
  study("repair", "수리", [], ["metal-extraction"], 250, 100, 7200, [{ text: "수리팩 제작가능", targetId: "repair-pack" }]),
  study("electronics", "전자", [], ["recycling"], 200, 50, 3600, [{ text: "전자 회로 제작가능", targetId: "electronic-circuit" }]),
  study("metal-processing", "금속 가공", [], ["metal-extraction", "basic-processing"], 250, 200, 10800, [{ text: "기초 과학 연구 키트 제작가능", targetId: "basic-science-kit" }]),
  study("chemical-engineering", "화학공학", [], ["basic-processing"], 250, 100, 7200, [], true),
  study("optical-separation-2", "광학 분리 II", [], ["crystal-compression", "optical-separation-1"], 250, 200, 10800, [{ text: "프리즘 농축가능" }], true),
  study("solar", "태양광", [], ["recycling", "optical-separation-1"], 300, 150, 3600, [{ text: "태양광 패널 제작가능", targetId: "solar-panel" }]),
];
