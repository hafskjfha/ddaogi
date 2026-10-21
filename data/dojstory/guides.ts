import type { Evidence, GuideBlock, GuideCell, GuideDocument } from "../../src/features/dojstory/model/types";
import { refs, sourced, unknown, tentative, sourceDate } from "./sources";
import { starforce, potential } from "./enhancements";

function display<T>(evidence: Evidence<T>, format: (value: T) => string): GuideCell {
  return "value" in evidence ? { ...evidence, value: format(evidence.value) } : evidence;
}
const sf = refs("starforce", "스타포스란?");
const pc = refs("potential", "규칙과 비용");
const dlc = refs("dlc", "DLC란?");
const power = refs("dlc", "dojPower란?");
const start = [...refs("research", "공정연구란?"), ...refs("workshop", "공방이란?"), ...refs("clarifications", "연구 이름과 조건")];
function paragraph(text: string, source: typeof sf): GuideBlock { return { kind: "paragraph", content: sourced(text, source) }; }

/** Explanatory guides contain only structured text and source-backed tables. */
export const guides: GuideDocument[] = [
  {
    id: "guide-getting-started", slug: "getting-started", title: "시작하기", summary: "장비, 공정연구와 공방을 탐색하는 순서", refs: start, checkedAt: sourceDate("research"), relatedIds: ["basic-processing", "crystal-compression", "basic-chair"],
    sections: [
      { title: "위키 읽는 법", blocks: [paragraph("이 위키는 사용자가 제공한 부분 자료와 정정·보완을 정리한 읽기 전용 도감입니다. 제공 자료 기재는 독립적인 공식 검증을 의미하지 않습니다. 미확인 정보와 추정·전언을 구분해 읽어 주세요.", start)] },
      { title: "연구에서 공방으로", blocks: [paragraph("기초 가공은 구리·철·프리즘 광산 채굴을 해금합니다. 결정 압축은 베이직 프리즘 제작법을 해금하지만, 실제 제작에는 별도 제작법 획득이 필요합니다.", [...start, ...refs("research", "결정 압축")]), paragraph("연구는 선행 연구 모두 충족 AND (요구 DOJpower 이상 OR 가치의 증표 착용)이 조건입니다. DOJpower 요구치는 소비 비용과 별개입니다. 개인 계정 상태가 없으므로 방문자의 해금 여부를 판정하지 않습니다.", start)] },
      { title: "자료가 더 필요한 부분", blocks: [paragraph("현재 수록분은 장비 16개, 연구 12개, 광산 3종입니다. 연구는 수집 계정에서 보인 범위이며 전체 연구 트리가 아닙니다. 이름만 확보한 아이템은 상세 정보 수집 중으로 표시합니다. 조합법 투입·산출 수량은 미확보입니다.", start)] },
    ],
  },
  {
    id: "guide-dlc-dojpower", slug: "dlc-dojpower", title: "DLC와 DOJpower", summary: "문제팩, 승급시험과 알려진 DOJpower 정보", refs: [...dlc, ...power], checkedAt: sourceDate("dlc"), relatedIds: ["basic-processing", "proof-of-worth"],
    sections: [
      { title: "DLC와 승급시험", blocks: [paragraph("DLC는 엄선된 문제 묶음 팩입니다. DOJ Extra Starter Pack 1/2, DOJ Extension I, DOJ Starter Pack 1/2/3/4가 자료에 등장합니다. 스타터팩은 C++ 기초 문법을 다루는 트레이닝으로 분류됩니다. 스타터팩 전체와 엑스트라 스타터팩 일부 문제에 힌트가 있으며, 스타터팩 이외의 문제에는 서브테스크가 배정됩니다.", dlc), paragraph("승급시험은 5문제를 30분 안에 모두 AC 받아야 통과합니다. 인터넷 검색은 불가능하며 시험 중 전체화면에서 이탈하면 실패합니다. 다음 숫자의 시험에는 이전 승급시험 통과가 필요합니다.", refs("dlc", "승급시험"))] },
      { title: "산정 범위와 미확인 산식", blocks: [paragraph("자료 설명에 따르면 DLC에서 DOJpower를 얻은 문제 중 상위 15문제가 반영됩니다. 승급시험 보너스는 10 × 성공 개수로 기재되어 있습니다. 정확한 산식·선정 기준·15문제 미만 처리와 등급표는 미확인입니다.", power), { kind: "paragraph", content: tentative("난이도와 획득 점수에 비례해 DOJpower가 정해지고, 기준 시간보다 오래 걸리면 감점되는 것으로 추정됩니다.", power, "자료 제공자의 추정이며 정확한 산식은 미확인") }] },
      { title: "확보된 레벨별 최대값", blocks: [{ kind: "table", caption: "원문에 기재된 최대 DOJpower (일부 수록)", headers: ["레벨", "최대 DOJpower"], rows: [[sourced("1", power), sourced("6.67", power)], [sourced("2", power), sourced("13.33", power)], [sourced("3", power), sourced("20.00", power)], [sourced("4", power), unknown("원문 ?", power)], [sourced("5", power), sourced("33.33", power)], [sourced("6~15", power), unknown("원문 ?", power)]] }] },
    ],
  },
  {
    id: "guide-starforce", slug: "starforce", title: "스타포스", summary: "기본 비용, 성공률과 실패 중 하락 확률", refs: [...starforce.refs, ...sf], checkedAt: sourceDate("starforce"), relatedIds: [],
    sections: [
      { title: "강화 규칙", blocks: [paragraph("스타포스는 매 시도 토큰을 소비해 장비를 강화합니다. 배경은 최대 20성, 다른 장비는 최대 15성입니다. 성공하면 기본 1성 상승하고, 실패하면 유지되거나 1성 하락합니다. 장비는 파괴되지 않습니다. 2단계 상승 효과는 성공 후 추가 판정하며 최대 단계를 넘지 않습니다.", sf), paragraph("표는 원문 기준 기본값입니다. 성공률 증가 효과는 기본 확률에 곱해 적용되고 비용 감소·하락 방지 효과도 최종 수치에 반영됩니다. 장비의 +n%는 강화 단계별 구체 수치가 미확인인 원문 표현입니다.", sf)] },
      { title: "조건부 하락률 읽기", blocks: [paragraph("실패 중 하락은 실패했을 때의 조건부 확률입니다. 강화 1회당 실제 하락률 = (1 − 성공률) × 실패 시 하락률입니다. 10→11성은 성공 55%, 실패 45%, 실패 시 하락 8%이므로 시도당 실제 하락 3.6%, 유지 41.4%입니다.", refs("clarifications", "스타포스 하락 확률"))] },
      { title: "기본 강화 표", blocks: [{ kind: "table", caption: "기본 토큰과 확률 (개인 보정 미적용)", headers: ["강화", "기본 토큰", "성공", "실패 중 하락"], rows: starforce.rows.map((row) => [sourced(`${row.from} → ${row.from + 1}`, starforce.refs), display(row.tokens, (value) => value.toLocaleString("en-US")), display(row.successPercent, (value) => `${value}%`), display(row.dropOnFailurePercent, (value) => `${value}%`)]) }] },
    ],
  },
  {
    id: "guide-potential", slug: "potential", title: "잠재해방", summary: "등급 상승, 줄 확장과 현재 관찰된 옵션", refs: potential.refs, checkedAt: sourceDate("potential"), relatedIds: ["potential-module", "suspicious-potential-module", "potential-line-extension"],
    sections: [
      { title: "대상과 소모 재료", blocks: [paragraph("배경을 제외한 장비에 사용할 수 있습니다. 개방·재설정에는 잠재능력 모듈 1개, 줄 확장에는 잠재 줄 확장 아이템 1개를 소비합니다. 처음 2줄로 시작해 최대 4줄까지 확장합니다. 재설정은 기존 줄 수를 유지하며 모든 줄을 다시 추첨합니다.", pc), paragraph("개방·재설정은 등급 상승을 먼저 판정합니다. 처음은 레어 기준으로 88% 레어, 12% 에픽입니다. 등급은 떨어지지 않고 한 번에 한 등급만 오릅니다. 줄 확장은 기존 등급과 옵션을 보존하고 새 줄만 추가하며 등급 상승 판정은 없습니다.", pc)] },
      { title: "등급 상승 기본값", blocks: [{ kind: "table", caption: "장착 효과가 없는 기본값; 아이템별 옵션 설정에 따라 풀 크기가 달라질 수 있음", headers: ["등급", "다음 등급 상승", "기본 등장 가능 옵션 수"], rows: potential.grades.map((grade) => [sourced(grade.name, potential.refs), display(grade.upgradePercent, (value) => `${value}%`), grade.poolSize]) }] },
      { title: "줄별 옵션 등급", blocks: [{ kind: "table", caption: "레어는 모든 줄이 레어; 첫 줄은 항상 현재 등급", headers: ["줄", "현재 등급", "한 단계 낮은 등급"], rows: potential.lines.map((line) => [sourced(line.line, potential.refs), display(line.currentPercent, (value) => `${value}%`), display(line.lowerPercent, (value) => `${value}%`)]) }, paragraph("각 줄은 옵션 등급을 정한 뒤 그 등급의 등장 가능 옵션 중 하나를 균등하게 추첨합니다. 같은 옵션이 여러 줄에 중복될 수 있습니다. 실제 화면 비용·확률은 장착 효과에 따라 달라질 수 있습니다.", potential.refs)] },
      { title: "관찰 옵션 15개", blocks: [paragraph("수상한 잠재능력 모듈에서 관찰한 레어 기준 목록이며 전체 옵션 풀이 아닙니다. 기본 풀 안내의 19/22개와 구분합니다.", refs("potential", "수상한 잠재능력 모듈")), { kind: "table", caption: "현재 관찰된 옵션 (일부 수록)", headers: ["원문 옵션", "수치 상태"], rows: potential.observedOptions.map((option) => [sourced(option.text, refs("potential", "수상한 잠재능력 모듈")), display(option.amount, () => "자료 기재")]) }] },
    ],
  },
];
