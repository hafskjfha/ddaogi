import type { Mine, Workshop } from "../../src/features/dojstory/model/types";
import { refs, sourced, unknown, tentative, sourceDate } from "./sources";

const r = refs("workshop", "광산");
const m = refs("workshop", "머신");
const p = refs("workshop", "발전소");
const xp = [...r, ...refs("clarifications", "광산 경험치")];
function mine(id: string, name: string, capacity: number, perProblem: string, consecutive: string, secondsPerOre: number, xpPerOre: number, outputItemId: string): Mine {
  return { id, slug: id, name, aliases: [name.replaceAll(" ", "")], refs: r, checkedAt: sourceDate("workshop"), capacity: sourced(capacity, r), perProblem: sourced(perProblem, r), consecutive: sourced(consecutive, r), secondsPerOre: sourced(secondsPerOre, r), xpPerOre: sourced(xpPerOre, xp), outputItemId, prerequisiteId: "basic-processing" };
}
export const workshop: Workshop = {
  refs: [...m, ...p, ...r, ...refs("clarifications", "광산 경험치")],
  machineLevels: [
    { level: 1, timeReduction: sourced(0, m), tokens: { status: "not-applicable", reason: "기본 레벨, 원문 비용 -", refs: m } },
    { level: 2, timeReduction: sourced(2, m), tokens: sourced(50, m) },
    { level: 3, timeReduction: sourced(4, m), tokens: sourced(100, m) },
    { level: 4, timeReduction: sourced(6, m), tokens: sourced(200, m) },
  ],
  machineCount: sourced(1, m),
  machineExpansion: tentative("연구로 머신 개수를 늘릴 수 있다고 전해짐", m, "자료 제공자의 전언이며 해당 연구 정보는 미확보"),
  moduleSlots: unknown("모듈 슬롯의 상세 자료 미확보", m),
  powerGrowth: tentative("레벨이 오를 때 제작 전력량이 증가한다고 알려짐", m, "전언이며 레벨별 전력량은 미확인"),
  durabilityMax: sourced(100, m), durabilityPerItem: sourced(1, m), repairRecovery: sourced(20, m), exhaustedTimeMultiplier: sourced(2, m),
  basePowerKw: sourced(200, p), solarPowerKw: unknown("태양광 패널 설치당 추가 발전량 미확인", p), shortageMultiplier: unknown("전력 부족 시 제작·연구가 느려지지만 감속 배율 미확인", p),
  personalModifiers: unknown("광산 관찰 수치의 개인 효과 적용 여부 미확인", r),
  streakRule: tentative("연속 해결은 날짜 기준인 듯함", r, "수집자의 추정이며 일일 스트릭 규칙으로 확정하지 않음"),
  mines: [mine("copper", "구리 광산", 10, "+1~3", "+2~4", 3600, 3600, "copper-ore"), mine("iron", "철 광산", 10, "+2~3", "+3~4", 3600, 3600, "iron-ore"), mine("prism", "프리즘 광산", 30, "+4~7", "+5~9", 1800, 1800, "prism-fragment")],
  mineLevels: [
    { level: 0, tokens: { status: "not-applicable", reason: "기본 레벨, 원문 -", refs: r }, ironIngots: { status: "not-applicable", reason: "원문 -", refs: r }, requiredXp: { status: "not-applicable", reason: "원문 -", refs: xp } },
    { level: 1, tokens: sourced(100, r), ironIngots: sourced(5, r), requiredXp: sourced(900, xp) },
    { level: 2, tokens: unknown("원문 ?토큰", r), ironIngots: sourced(10, r), requiredXp: unknown("원문 ?", xp) },
    { level: 3, tokens: sourced(400, r), ironIngots: sourced(15, r), requiredXp: sourced(3600, xp) },
  ],
  mineRules: sourced(["레벨업마다 업그레이드 1포인트를 획득합니다.", "포인트당 기본 용량 +20%, 기본 증가량 +60%, 기본 채굴 시간 −5% 중 선택할 수 있습니다.", "경험치 게이지가 가득 차면 추가 경험치는 쌓이지 않습니다. 레벨업 후 0부터 다시 시작합니다.", "재분배는 무료이며 적용 전까지 기존 성능을 유지합니다."], r),
};
