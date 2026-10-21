import type { WikiItem, EquipmentSlot } from "../../src/features/dojstory/model/types";
import { refs, sourced, unknown, sourceDate } from "./sources";

/** Equipment values are a transcription of the preserved equipment source. */
function equipment(id: string, name: string, slot: EquipmentSlot, options: string[], auctionable: boolean, ai: boolean | null, power: number, starforce: string, image: string | null): WikiItem {
  const r = refs("equipment", name);
  return { id, slug: id, name, aliases: [], kind: "equipment", refs: r, checkedAt: sourceDate("equipment"), slot: sourced(slot, r), options: sourced(options, r), auctionable: sourced(auctionable, r), aiGenerated: ai === null ? { status: "not-applicable", reason: "비배경 장비에는 AI 여부를 표시하지 않음", refs: refs("clarifications", "장비 AI 여부와 이미지") } : sourced(ai, r), requiredDojpower: sourced(power, r), starforce: sourced(starforce, r, "원문 +n%: 단계별 수치 미확인"), image: image ? sourced(image, r) : unknown("이미지 자료 미확보", r), acquisition: unknown("획득 방법 미기재", r) };
}
/** Named entries retain their source without inventing classification or stats. */
function minimal(id: string, name: string, source: string, section: string): WikiItem {
  const r = refs(source, section);
  const missing = unknown("이름만 확보, 상세 정보 수집 중", r);
  return { id, slug: id, name, aliases: [], kind: "minimal", refs: r, checkedAt: sourceDate(source), slot: missing, options: missing, auctionable: missing, aiGenerated: missing, requiredDojpower: missing, starforce: missing, image: missing, acquisition: missing };
}

export const items: WikiItem[] = [
  equipment("coding-magical-girl", "「【코딩】의 마법을 지닌 마법소녀」", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], false, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDcvMTZlZGYyNDktYWI1MS00NGRhLWIzMzktYzRkNjdlNTdhZTQyLnBuZw"),
  equipment("doj-grand-contest-1", "DOJ Grand Contest 1", "background", ["토큰 획득량 +10%", "모든 드롭률 +10%"], true, true, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMTAvYTg1YjQ2OWUtN2U4Ni00OGZlLTk0MzAtODdlNWRmMTkzYmNhLnBuZw"),
  equipment("orchard-cup-1", "제1회 과수원컵", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], false, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMTAvMTVkMjQ1NTYtNDAyMi00MzJiLTg2YzctZWRkZWZjYWIwY2NiLnBuZw"),
  equipment("sjupc-2026", "SJUPC 2026", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], true, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDkvYTBjZDdjNjgtNGNkYi00MjAwLTljMjgtMDllOGNlNzkyZWZlLndlYnA"),
  equipment("dream-afterimage", "꿈의 잔상", "background", ["토큰 획득량 +10%", "모든 드롭률 +10%"], true, true, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDkvYzI5NjY0YjgtMjU3OC00ZGMxLTk2MDMtYzEzMDlmODBkYzE3LnBuZw"),
  equipment("dream-echo", "꿈의 잔향", "background", ["토큰 획득량 +10%", "모든 드롭률 +10%"], true, true, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDkvMWQzZjQzYjYtZjc0NC00YzcwLTljMWYtYmFjMjUyYThmNTY2LnBuZw"),
  equipment("centroid-cup-2026", "2026 Centroid Cup", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], true, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDkvNzViYWM2YWMtMmUwMi00NDBmLTkyMGEtYzAyMzNjM2UzZDY4LnBuZw"),
  equipment("accomplices-ko", "공범자 모집 중", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], false, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMTAvYjE3YmJmOTktNGMyNC00MTZmLTllNzAtMjljNGY4OTE4NjA3LnBuZw"),
  equipment("accomplices-ja", "共犯者募集中", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], false, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMTAvYWFlMTJlN2ItOWVkMi00YWQwLWFjZDktZWNjMDZmMjJjZWJiLnBuZw"),
  equipment("test-background", "테스트용 배경", "background", ["토큰 획득량 +15%", "모든 드롭률 +15%"], true, false, 0, "토큰 획득량 +n%", "https://doj.kr/api/storage-assets/cHJvZmlsZS1iYW5uZXJzLzIwMjYvMDgvNDdhMDc0YzQtNTdhMy00NzE3LThjMDktODcyYzNhYzM3YzEyLnBuZw"),
  equipment("basic-doll", "기본 인형", "doll", ["스트릭 보호 확률 +3%", "모든 드롭률 +4%"], true, null, 0, "토큰 획득량 +n%", null),
  equipment("golden-heart-doll", "금빛 심장을 품은 아이", "doll", ["스트릭 보호 확률 +6%", "모든 드롭률 +8%"], true, null, 100, "토큰 획득량 +n%", "/dojstory/golden-heart-doll.svg"),
  equipment("basic-keyring", "기본 키링", "keyring", ["스타포스 성공확률 +3%", "잠재능력 등급 상승 확률 +3%"], true, null, 0, "토큰 획득량 +n%", null),
  equipment("basic-bag", "기본 가방", "bag", ["토큰 획득량 +10%", "상점 구매 비용 감소 +0.5%"], true, null, 0, "토큰 획득량 +n%", null),
  equipment("basic-laptop", "기본 노트북", "laptop", ["일반 제출 쿨타임 감소 +3%", "게시판 작성 쿨타임 감소 +3%"], true, null, 0, "토큰 획득량 +n%", null),
  equipment("basic-chair", "기본 의자", "chair", ["공방 연구속도 +3%", "머신 제작 속도 +3%"], true, null, 0, "토큰 획득량 +n%", null),
  minimal("proof-of-worth", "가치의 증표", "research", "요구 DOJpower"),
  minimal("basic-prism", "베이직 프리즘", "research", "결정 압축"),
  minimal("aurora-prism", "오로라 프리즘", "clarifications", "연구 효과와 소비 재료"),
  minimal("iron-ingot", "철 주괴", "research", "금속 추출"),
  minimal("repair-pack", "수리팩", "research", "수리"),
  minimal("electronic-circuit", "전자 회로", "research", "전자"),
  minimal("basic-science-kit", "기초 과학 연구 키트", "research", "금속 가공"),
  minimal("solar-panel", "태양광 패널", "research", "태양광"),
  minimal("copper-ore", "구리 광물", "workshop", "광산"),
  minimal("iron-ore", "철 광물", "workshop", "광산"),
  minimal("prism-fragment", "프리즘 조각", "workshop", "광산"),
  minimal("potential-module", "잠재능력 모듈", "potential", "사용 방법"),
  minimal("suspicious-potential-module", "수상한 잠재능력 모듈", "potential", "수상한 잠재능력 모듈"),
  minimal("potential-line-extension", "잠재 줄 확장 아이템", "potential", "사용 방법"),
];
