import type { Potential, Starforce } from "../../src/features/dojstory/model/types";
import { refs, sourced, unknown } from "./sources";

const s = refs("starforce", "성공확률 표");
const corrected = [...s, ...refs("clarifications", "스타포스 하락 확률")];
/** Source rows store conditional failure drop rates, never per-attempt rates. */
export const starforce: Starforce = {
  refs: corrected,
  maxBackground: sourced(20, refs("starforce", "스타포스란?")), maxOther: sourced(15, refs("starforce", "스타포스란?")),
  rows: [
    [0, 30, 95, 0], [1, 52, 91, 0], [2, 89, 87, 0], [3, 153, 83, 0], [4, 263, 79, 0],
    [5, 452, 75, 0], [6, 777, 71, 0], [7, 1336, 67, 0], [8, 2298, 63, 0], [9, 3953, 59, 0],
    [10, 6798, 55, 8], [11, 11693, 51, 12], [12, 20112, 47, 16], [13, 34593, 43, 20], [14, 59500, 39, 24],
    [15, 102341, 35, 28], [16, 176026, 31, 32], [17, 302764, 27, 36], [18, 520755, 23, 40], [19, 895698, 19, 44],
  ].map(([from, tokens, success, drop]) => ({ from, tokens: sourced(tokens, s), successPercent: sourced(success, s), dropOnFailurePercent: sourced(drop, corrected) })),
};
const p = refs("potential", "확률 안내");
const observed = refs("potential", "수상한 잠재능력 모듈");
export const potential: Potential = {
  refs: [...p, ...observed],
  grades: [
    { name: "레어", upgradePercent: sourced(12, p), poolSize: sourced(19, p) },
    { name: "에픽", upgradePercent: sourced(6, p), poolSize: sourced(19, p) },
    { name: "유니크", upgradePercent: sourced(2, p), poolSize: sourced(22, p) },
    { name: "레전드리", upgradePercent: sourced(0, p), poolSize: sourced(22, p) },
  ],
  lines: [[1, 100, 0], [2, 50, 50], [3, 30, 70], [4, 10, 90]].map(([line, current, lower]) => ({ line, currentPercent: sourced(current, p), lowerPercent: sourced(lower, p) })),
  observedOptions: [
    { text: "프로필 프레임 밝기 +3%", amount: sourced(3, observed) },
    { text: "주간 도전과제 토큰 보상 +10%", amount: sourced(10, observed) },
    { text: "게시판 작성 쿨탐 1초 감소", amount: sourced(1, observed) },
    { text: "프로필 반짝임 +?%", amount: unknown("원문 +?%: 수치 미확인", observed) },
    { text: "토큰 획득량 +5%", amount: sourced(5, observed) },
    { text: "머신 제작속도 +5%", amount: sourced(5, observed) },
    { text: "공방 연구속도 +5%", amount: sourced(5, observed) },
    { text: "스타포스 성공시 추가 1성 확률 +0.05%", amount: sourced(0.05, observed) },
    { text: "스타포스 성공확률 +0.5%", amount: sourced(0.5, observed) },
    { text: "장비 드롭률 +5%", amount: sourced(5, observed) },
    { text: "일반 제출 쿨타임 감소 1초", amount: sourced(1, observed) },
    { text: "일반 제출 쿨타임 감소 +0.5%", amount: sourced(0.5, observed) },
    { text: "모든 드롭률 +3%", amount: sourced(3, observed) },
    { text: "스트릭 보호확률 +1%", amount: sourced(1, observed) },
    { text: "경매장 수수료 감소 +0.1%", amount: sourced(0.1, observed) },
  ],
};
