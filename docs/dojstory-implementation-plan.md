# DOJstory Wiki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 사용자가 제공한 자료 6개와 정정·보완 자료 1개로 장비·연구 도감과 공방·DLC·강화 가이드를 구현하고, 미확인 정보와 출처를 함께 탐색하게 한다.

**Architecture:** 로컬 원문을 보존하고 출처가 연결된 정규 데이터를 별도로 작성한다. Next.js 서버 컴포넌트가 데이터를 검증·조회하며, 이미지 실패 처리만 클라이언트 컴포넌트로 분리한다. 게임 조작·계정 연동·계산기는 구현하지 않는다.

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript, Tailwind CSS 4, 기존 Radix UI·Lucide React·Vitest·Testing Library. 첫 버전에는 새 런타임 의존성을 추가하지 않는다.

**Spec:** [위키 설계](./dojstory-design.md), [자료 요청서](./dojstory-data-request.md), [사용자 정정·보완](./dojstory-data/clarifications.md). 같은 항목은 사용자 보완 자료를 우선하며, 정규 데이터에 원문과 보완 자료의 근거를 함께 연결한다. 이 계획의 범위 결정은 아래 실제 자료에 맞춰 최초 설계를 구체화한다.

작성일: 2026-10-22 KST. 2026-10-22 KST 구현 및 검증 완료. 아래 체크박스는 실행 결과를 반영한다. 기존 문서와 나란히 관리하기 위해 `docs/dojstory-implementation-plan.md`에 저장한다. 저장소의 기본 `docs/superpowers` 경로는 현재 ignore 대상이다.

## Global Constraints

- “임의의 아이템·조합법·수치는 생성하지 않는다.” 사용자 원문 6개는 보존하고 정정은 보완 자료에 기록한다. 누락 값을 추정해 채우지 않는다.
- “미확인 값을 0, 빈 배열, false 등 실제 의미가 있는 값으로 대체하지 않는다.” 무료·즉시 완료·요구치 0은 명시된 실제 값으로 유지한다.
- “DOJpower 요구치와 연구에 소비되는 비용은 따로 기록한다.” 연구 조건은 `선행 연구 모두 충족 AND (요구 DOJpower 이상 OR 가치의 증표 착용)`이다.
- “개인별 해금 여부는 계정 데이터가 없는 상태에서 판정하지 않는다.” 원문 수집 계정의 dojPower 219.99를 방문자 상태로 취급하지 않는다.
- “일부만 확보된 목록은 전체 개수나 완전한 목록으로 표시하지 않는다.” 16개·12개는 현재 수록 수이지 게임 전체 수가 아니다.
- 사용자 자료에 기재된 사실과 추정·전언을 구분한다. 이 위키가 독립적으로 공식 검증한 정보라고 표시하지 않는다.
- 구현 전 `AGENTS.md` 및 설치된 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다. 주요 함수·컴포넌트에 JSDoc을 작성한다.
- 기존 유저·대회 분석의 데이터 기준 시점과 동작을 유지한다. 위키 자료의 확인일을 전체 서비스 기준일로 덮어쓰지 않는다.

## Review Focus

1. 자료에 직접 적힌 값도 공식 검증 상태와 같지 않다. 확인일이 없는 장비·잠재 자료에 임의 날짜를 붙이지 않는다. Task 1·3에서 검증한다.
2. 비배경 장비의 AI 여부는 해당 없음·화면 미표시, 무료 연구는 비용 0, 광학 분리 I·화학공학의 `x`는 효과 없음으로 구분한다. Task 1·4·5에서 검증한다.
3. 모든 선행 연구 AND 대체 해금 OR 조건을 보존하고, 오로라 프리즘 해금·별도 조합법 획득과 연구 키트 소비를 사용자 보완대로 적용한다. Task 1·2·5에서 검증한다.
4. 스타포스 실패 시 조건부 하락률과 시도당 실제 하락률을 구분하고 광산 필요 게이지를 XP로 통일한다. 이 두 사항을 미확인·충돌로 표시하지 않는다. Task 1·6에서 검증한다.
5. 외부 이미지 실패·URL 쿼리 반복·이름 표기 차이·알 수 없는 상세 주소가 탐색 전체를 망가뜨리지 않는다. Task 2·3·4·7에서 검증한다.

## 확보 자료와 구현 가능한 범위

| 원문 | 확보 내용 | 현재 구현할 내용 | 보류할 내용 |
| --- | --- | --- | --- |
| [equipment.md](./dojstory-data/equipment.md) | 장비 16개, 6개 부위, 기본 옵션·경매 여부·착용 요구치, 이미지 일부 | 공통 아이템 도감의 장비 목록·상세, 부위·이름 검색 | 획득처, 등급, 강화 단계별 옵션 수치 등 미기재 필드 |
| [process_research.md](./dojstory-data/process_research.md) | 연구 12개, 선행 조건·요구치·비용·시간·효과 일부 | 연구 목록·상세, 선행·후속 탐색, 연결된 아이템 | 전체 연구 트리, 개인별 해금 판정, 숨은 연구 |
| [workshop.md](./dojstory-data/workshop.md) | 머신·공정연구·발전소·광산, 3종 광산과 일부 수치 | 공방 안내, 머신 레벨표, 광산별 상세와 미확인 표시 | 실제 생산 레시피·전력 감속 공식·설비 시뮬레이터 |
| [starforce.md](./dojstory-data/starforce.md) | 20개 단계 행, 비용·기본 성공·실패 중 하락 비율, 최대 단계 | 스타포스 가이드와 원문 기준 기본 표 | 개인 보정·기대 비용·최적화 계산 |
| [potential.md](./dojstory-data/potential.md) | 등급 상승·줄 수 규칙, 15개 관찰 옵션, 일부 수치 미확인 | 잠재해방 가이드, 등급표·줄별 표·관찰 옵션 목록 | 전체 옵션 풀, 아이템별 확률 계산 |
| [dlc_dojpower.md](./dojstory-data/dlc_dojpower.md) | DLC·승급시험, 상위 15문제, 일부 최대값, 추정 산정 설명 | DLC·dojPower 가이드와 알려진 값 표 | 정확한 산식, 미기재 레벨 최대값, 등급표 |
| [clarifications.md](./dojstory-data/clarifications.md) | 이름·연구 조건·효과·소비 재료·조건부 확률·XP·AI 표시 정정 | 정규 데이터·화면·검증의 우선 근거 | 기존 미확인 수치의 추정 보완은 하지 않음 |

자료 확인 시점은 DLC 2026-10-21 23:00, 연구 2026-10-22 00:00, 공방 00:35, 스타포스 01:21 KST이다. 사용자 보완은 2026-10-22 KST의 추가 설명이다. 장비·잠재 원문의 확인일은 여전히 없으며, 일부 항목의 보완일을 전체 장비·잠재 자료의 확인일로 대신하지 않는다.

### 첫 버전의 주소와 설계 변경

| 주소 | 내용 |
| --- | --- |
| `/dojstory` | 전체 검색 결과, 도감·가이드 진입, 수록 범위와 자료 상태 |
| `/dojstory/items`, `/dojstory/items/[slug]` | 장비와 원문에 이름이 등장한 재료·아이템의 최소 항목 |
| `/dojstory/research`, `/dojstory/research/[slug]` | 확보 연구 12개와 선행·후속 링크 |
| `/dojstory/workshop` | 머신·전력·광산 개요 및 자료표 |
| `/dojstory/workshop/mines/[slug]` | 구리·철·프리즘 광산의 개별 정보 |
| `/dojstory/guides/[slug]` | `getting-started`, `dlc-dojpower`, `starforce`, `potential` |
| `/dojstory/sources/[sourceId]` | 허용된 원문 6개와 보완 자료 1개를 텍스트로 열람하는 출처 화면 |

게임에 표시된 실제 용어인 **공방·머신·발전소·광산**을 사용한다. 기존 설계의 `/factories`는 아직 공개된 경로가 아니므로 리다이렉트 없이 위 구조로 구체화한다.

투입·산출 조합을 확보하지 못했으므로 `/recipes` 목록·상세는 이번에 만들지 않는다. 연구에 결과물 이름이 있어도 조합법을 완성해서 등록하지 않는다. `/updates`도 후속 범위로 두고 이번에는 홈에 자료 기준·수록 상태만 표시한다. 없는 메뉴로 연결되는 링크를 만들지 않는다.

## 원문 정규화 결정과 추가 확인 항목

| 원문 사례 | 구현 결정 |
| --- | --- |
| `기초가공`·`기초 가공`, `결정압축`·`결정 압축`, `광학분리 I`·`광학 분리 I` | 정식 이름은 `기초 가공`, `결정 압축`, `광학 분리 I`로 확정한다. 붙여 쓴 표기는 검색 별칭으로만 사용하며 같은 연구 ID에 연결한다. |
| 연구의 `dojPower 50이상 or 가치의 증표 착용` 등 | `선행 연구 모두 충족 AND (해당 연구의 요구 DOJpower 이상 OR 가치의 증표 착용)`으로 표시한다. 가치의 증표가 선행 연구를 대체하지 않는다. |
| `가치의 증표`의 세부 정보 없음 | 출처가 있는 이름만 아이템 최소 항목으로 만든다. 부위·능력치·획득 방법을 생성하지 않는다. |
| 오로라 합성 효과 정정 | `오로라 프리즘 제작법 해금`으로 반영한다. 조합법을 별도로 획득해야 실제 제작 가능함을 명시하고, 오로라 프리즘을 보완 자료가 근거인 최소 아이템으로 연결한다. |
| 결정 압축의 별도 제작법 획득 필요 | 연구 해금만으로 제작 가능하다고 표시하지 않는다. 조합법 해금·소유 조건을 원문 설명으로 보존한다. |
| 광학 분리 I·화학공학의 효과 `x` | 실제 효과 없음으로 확정해 표시한다. 구조화된 효과 목록은 `sourced` 상태의 빈 목록으로 둘 수 있다. 미확인 값과 구분한다. |
| 화학공학·광학 분리 II의 시간 필드에 연구 키트 10개 병기 | 두 연구 각각 기초 과학 연구 키트 10개를 소비 재료로 등록한다. 소요 시간과 분리하고 토큰 외 연구 비용에 포함한다. |
| 스타포스 `실패 중 하락` | 실패했을 때의 조건부 하락률이다. 실제 하락률은 `(1 - 성공률) × 실패 시 하락률`이다. 10→11성은 성공 55%, 실패 시 하락 8%, 시도당 하락 3.6%, 유지 41.4%로 설명한다. 충돌 표시를 제거한다. |
| 광산 표의 `필요 사용게이지`와 본문의 채굴당 XP | 같은 경험치 단위다. 표를 `필요 경험치(XP)`로 정규화하고 기존 수치는 그대로 사용한다. 원문에 없는 수치는 채우지 않는다. |
| 광산 레벨 2 토큰·게이지 `?` | 미확인으로 둔다. 레벨 1·3에서 보간하지 않는다. |
| 광산 연속 해결 효과에 `날짜 기준인듯` | 수집자가 추정한 내용으로 표시한다. 일일 스트릭 규칙으로 확정하지 않는다. |
| 머신 개수 증가 연구·레벨별 전력 증가의 전언 | 미검증 설명으로 표시하고 가상의 연구·전력표를 만들지 않는다. |
| 잠재 옵션 풀은 19/22개 안내, 관찰 옵션은 15개 | 기본 풀 안내와 관찰 목록을 분리한다. 없는 옵션을 채우거나 관찰 15개를 완전한 풀로 간주하지 않는다. |
| 프로필 반짝임 `+?%`, 장비 스타포스 효과 `+n%` | 원문 문자열과 수치 미확인 표시를 함께 제공한다. 숫자로 파싱하지 않는다. |
| 비배경 장비의 AI 여부·미확보 이미지 | AI 여부는 배경에만 표시한다. 비배경은 `not-applicable`로 관리하고 행·배지를 숨기며 false나 미확인으로 표시하지 않는다. 추가 이미지는 추후 확보하고 현재 없는 이미지는 기본 표시를 사용한다. |
| `금빛 심장을 품은 아이`에 SVG 원문 제공 | 해당 SVG의 도형을 정적 로컬 SVG 자산으로 옮길 수 있다. 원문 HTML 전체를 삽입하지 않는다. |

위 확인 사항은 도감 구현을 막지 않는다. 추가 캡처는 후속 보완이며 현재 계획의 시작 조건이 아니다.

## 파일 구조와 공통 인터페이스

초안의 JSON 방식은 이번에 한해 **타입 검사되는 TypeScript 정규 데이터**로 구체화한다. 원문이 비정형이고 필드별 미확인·충돌이 많아, 새 파서·스키마 의존성 없이 `satisfies`와 관계 검증으로 관리하기 위해서다. 실제 자료의 전사본이며 가상 mock 데이터가 아니다. 원문 Markdown은 근거로 유지하고 매 요청 자동 파싱하지 않는다.

| 파일 또는 디렉터리 | 책임 |
| --- | --- |
| `data/dojstory/{sources,items,research,workshop,enhancements,guides}.ts` | 원문 6개와 보완 자료 1개를 반영한 구조화 데이터. 게임 로직 없음 |
| `src/features/dojstory/model/types.ts` | 공통 데이터·출처·확인 상태 타입 |
| `src/features/dojstory/data/{validateWikiDataset,loadDojstoryWiki,queryWiki,buildWikiRelations,loadWikiSource}.ts` | 참조 검증, 서버 읽기, 조회·검색, 역참조, 원문 읽기 |
| `src/features/dojstory/components` | 출처·확인 상태, 검색 폼, 도감·연구·공방·가이드 표시 |
| `src/app/dojstory` | 서버 라우트·메타데이터·공통 레이아웃·오류 처리 |
| `public/dojstory/golden-heart-doll.svg` | 제공된 도형만 옮긴 실제 아이템 자산 |

핵심 타입은 다음 계약을 사용한다. `sourced`는 제공 자료 또는 사용자 보완에 명시되었다는 의미이며 공식 검증 완료 표시가 아니다. 정정된 값은 보완 자료를 우선 근거로 참조한다. `tentative`의 값은 추정·전언 라벨을 항상 동반한다.

```ts
type SourceRef = { sourceId: string; section: string };
type Evidence<T> =
  | { status: "sourced" | "tentative"; value: T; refs: SourceRef[]; note?: string }
  | { status: "unknown" | "not-applicable"; reason: string; refs: SourceRef[] }
  | { status: "conflict"; claims: { text: string; refs: SourceRef[] }[] };
type WikiQuery = { q: string; kind: "all" | "item" | "research" | "guide" | "workshop"; slot: string };
type WikiSearchResult = { id: string; kind: Exclude<WikiQuery["kind"], "all">; title: string; href: string; summary: string };
type RelatedLink = { id: string; title: string; href: string; label: string };
type SourceDocument = { id: string; title: string; checkedAt: Evidence<string>; externalUrls: string[]; text: string };
```

`WikiDataset`는 `sources`, `items`, `research`, `workshop`, `starforce`, `potential`, `guides`를 갖는다. `WikiItem`과 `WikiResearch`에는 안정적인 `id`, `slug`, `name`, 출처와 필드별 `Evidence`를 둔다. `GuideDocument`는 `slug`, `title`, 출처와 `sections`를 가지며 문단·목록·표의 구조화된 블록으로 구성한다. 자유 HTML과 JSX는 받지 않는다. `WikiDataset`의 나머지 필드는 원문 표의 열에 맞춰 정의하고 같은 Evidence 계약을 따른다.

내부 ID는 게임 ID처럼 표시하지 않는다. 테스트와 링크에서 사용할 고정 slug는 `basic-chair`, `basic-doll`, `golden-heart-doll`, `basic-processing`, `crystal-compression`, `aurora-synthesis`, `optical-separation-1`, `copper`, `iron`, `prism`으로 정한다. 다른 항목도 한 번 부여한 slug를 유지한다.

## Task 1: 실제 자료 전사와 검증 가능한 데이터셋

**Files:** Create `src/features/dojstory/model/types.ts`, `src/features/dojstory/data/validateWikiDataset.ts`, `data/dojstory/{sources,items,research,workshop,enhancements,guides}.ts`. Test `src/features/dojstory/data/validateWikiDataset.test.ts`.

**Interfaces:** Produces `WikiDataset`, `WikiItem`, `WikiResearch`, `GuideDocument`, 위 공통 타입; `validateWikiDataset(data: WikiDataset): string[]` — 정상은 빈 오류 목록. 각 데이터 모듈은 같은 이름의 named export를 제공하고, 집계는 Task 2에서 한다.

- [x] 제공 자료에서 실제 항목을 전사하면서 `preservesCollectedSourceFacts` 테스트를 작성한다. 장비 16개, 연구 12개, 스타포스 행 20개, 관찰 잠재 옵션 15개를 확인한다. 장비 수는 `kind === "equipment"`만 센다. 최소 아이템 수는 고정하지 않는다.
- [x] 같은 테스트에서 `basic-doll`의 AI 여부 해당 없음, `basic-processing`의 무료·0초, 광학 분리 I·화학공학의 확인된 빈 효과 목록, 두 연구의 키트 10개 소비를 확인한다. 레벨 4 DOJpower·프로필 반짝임 수치·장비와 잠재 원문 확인일은 계속 미확인이다. `appliesUserClarificationsWithoutGuessingOtherFields`로 정식 이름·오로라 프리즘·조건 구조·XP 정규화와 보완 출처를 검사한다.
- [x] `rejectsBrokenReferencesAndDuplicateIdentity`를 작성한다. 실제 전사 항목의 복제본으로 ID·slug 중복과 잘못된 sourceId·연구 참조를 만들면 오류가 반환되어야 한다. 이는 검증용 잘못된 입력이며 게임 샘플로 공개하지 않는다.
- [x] 실행: `npm test -- src/features/dojstory/data/validateWikiDataset.test.ts`. 처음에는 모듈 부재 또는 필수 사실 불일치로 FAIL하는지 확인한다.
- [x] 타입과 데이터를 구현한다. 참조는 존재하는 항목 또는 출처가 있는 최소 항목만 허용한다. 검증은 출처 누락·ID/slug 중복·끊긴 참조·음수 비용/시간·0~100 밖 확률을 검사한다. 게임에 없는 규칙을 검증식으로 강제하지 않는다.
- [x] 위 명령으로 PASS를 확인한 뒤 해당 파일만 커밋한다. 제안 메시지: `feat: add sourced DOJstory wiki dataset`.

## Task 2: 서버 로더와 검색 및 관계 조회

**Files:** Create `src/features/dojstory/data/{loadDojstoryWiki,queryWiki,buildWikiRelations}.ts`. Tests: 같은 디렉터리의 `loadDojstoryWiki.test.ts`, `queryWiki.test.ts`, `buildWikiRelations.test.ts`.

**Interfaces:** Consumes Task 1 타입·데이터·검증 함수. Produces `loadDojstoryWiki(): Promise<WikiDataset>`, `normalizeWikiQuery(raw: Record<string, string | string[] | undefined>): WikiQuery`, `searchWiki(data: WikiDataset, query: WikiQuery): WikiSearchResult[]`, `findWikiItem(data: WikiDataset, slug: string): WikiItem | null`, `findWikiResearch(data: WikiDataset, slug: string): WikiResearch | null`, `getWikiRelations(data: WikiDataset, id: string): RelatedLink[]`.

- [x] `findsRealEntriesAndKeepsUnknownDistinct`와 `preservesKnownResearchLinks`를 작성한다. `기초가공` 검색이 기초 가공에 도달하고 결정 압축에서 기초 가공 링크를 얻으며, 수리팩 같은 이름만 있는 항목은 최소 항목으로 반환되어야 한다. 존재하지 않는 slug는 null이다.
- [x] `normalizesRepeatedAndUnsupportedFilters`를 작성한다. 반복 쿼리는 첫 값 사용, 없는 `q`는 빈 문자열, 지원하지 않는 kind는 `all`, 미지원 slot은 빈 문자열이다. `slot`은 실제 6개 장비 부위의 고정 키만 받는다. 공백·대소문자·유니코드 정규화는 검색에만 적용하고 이름·ID는 바꾸지 않는다.
- [x] `failsForInvalidDatasetRatherThanShowingEmptyCatalog`를 작성한다. Task 1 검증 오류가 있으면 로더가 원인을 포함한 오류를 던지고 빈 도감으로 대체하지 않는다.
- [x] 실행: `npm test -- src/features/dojstory/data`. 위 신규 테스트의 FAIL을 확인한다.
- [x] 로더는 `server-only`로 보호하고 정규 데이터만 집계한다. 검색·관계 함수는 순수 함수로 구현한다. 선행·후속과 아이템 사용처는 명시 참조에서 역산하며, 보이지 않는 연구나 조합법 링크는 생성하지 않는다. 결과 정렬은 이름 오름차순이다.
- [x] 위 명령으로 PASS 확인 후 커밋한다. 제안 메시지: `feat: add DOJstory wiki queries and relations`.

## Task 3: 위키 홈과 출처를 읽을 수 있는 공통 화면

**Files:** Create `src/app/dojstory/{layout,page,loading,error,not-found}.tsx`, `src/app/dojstory/sources/[sourceId]/page.tsx`, `src/features/dojstory/data/loadWikiSource.ts`, `src/features/dojstory/components/{WikiNav,WikiSearchForm,EvidenceNotice,SourceReferences}.tsx`. Tests: `src/app/dojstory/page.test.tsx`, `src/features/dojstory/data/loadWikiSource.test.ts`.

**Interfaces:** Consumes Task 2 API. Produces `loadWikiSource(sourceId: string): Promise<SourceDocument | null>`, `EvidenceNotice({ status, note }: { status: Evidence<never>["status"]; note?: string })`, `SourceReferences({ refs }: { refs: SourceRef[] })`. `WikiSearchForm`는 GET 폼이며 `q`, `kind`, `slot`을 제출한다.

- [x] 홈 테스트 `searchesCollectedDataAndDisclosesPartialCoverage`를 작성한다. 연구·장비 결과, 수록분 표시, 게임 전체 개수라는 표현의 부재, 조합법 메뉴 부재를 확인한다. 검색 없음과 검색 결과 0개도 구분한다.
- [x] 출처 테스트 `readsOnlyRegisteredSourcesAsPlainText`를 작성한다. 등록된 원문은 정확한 텍스트를 반환하고 미등록 ID·경로 탈출 문자열은 null이다. 확인일이 없는 원문은 확인일 미확인으로 반환한다.
- [x] 실행: `npm test -- src/app/dojstory/page.test.tsx src/features/dojstory/data/loadWikiSource.test.ts`. 신규 테스트 FAIL 확인 후 구현한다.
- [x] 출처의 ID→파일 경로는 원문 6개와 보완 자료 1개, 총 7개 고정 허용 목록으로 작성한다. 외부 주소를 요청하거나 입력 ID를 파일 경로에 직접 붙이지 않는다. 출처 페이지는 원문을 `<pre>`의 텍스트 자식으로 표시해 HTML 표·SVG 문자열도 실행하지 않는다. 공개 화면에 로컬 절대 경로를 노출하지 않는다.
- [x] Next.js의 `params`·`searchParams`를 await한다. 출처 누락은 `notFound()`, 읽기 실패는 오류 경계로 보낸다. 홈과 상세 화면 모두 `SourceReferences`로 원문 페이지와 외부 근거 링크에 도달할 수 있게 한다.
- [x] 빈 도감·없는 문서·읽기 실패·필드 미확인을 다른 문구로 제공한다. 위 명령으로 PASS 확인 후 커밋한다. 제안 메시지: `feat: add DOJstory wiki home and source views`.

## Task 4: 장비와 최소 아이템 도감

**Files:** Create `src/app/dojstory/items/page.tsx`, `src/app/dojstory/items/[slug]/page.tsx`, `src/features/dojstory/components/{ItemCatalog,ItemDetails,ItemArtwork}.tsx`, `public/dojstory/golden-heart-doll.svg`. Modify `next.config.ts`. Tests: `src/features/dojstory/components/ItemCatalog.test.tsx`, `ItemDetails.test.tsx`, `ItemArtwork.test.tsx`.

**Interfaces:** Consumes Task 2 item 조회·검색·관계 API와 Task 3 출처 표시. Produces `ItemCatalog({ items }: { items: WikiItem[] })`, `ItemDetails({ item, related }: { item: WikiItem; related: RelatedLink[] })`, `ItemArtwork({ name, src, slot }: { name: string; src: string | null; slot: string | null })`.

- [x] `showsRealEquipmentAndUnknownFields`를 작성한다. 기본 의자의 연구·머신 속도 +3%, 금빛 심장을 품은 아이의 요구치 100을 확인한다. 비배경 장비에는 AI 여부 행·배지가 없고 배경에는 자료의 true/false가 표시되어야 한다. 최소 아이템에서 능력치·획득처가 생성되지 않아야 한다.
- [x] `filtersEquipmentWithoutHidingNamedMaterials`와 `fallsBackWhenImageFails`를 작성한다. 기본 목록에는 최소 항목도 나오며 부위 필터는 장비만 추린다. 외부 이미지 오류 후 이름·기본 표시와 상세 링크가 유지되어야 한다.
- [x] 실행: `npm test -- src/features/dojstory/components/Item`. 신규 테스트 FAIL 확인 후 구현한다.
- [x] 장비명·기본 옵션·경매 여부·요구 DOJpower·스타포스 설명을 자료대로 제공한다. AI 여부는 배경에만 표시한다. `+n%`를 단계별 확정 수치로 바꾸지 않는다. 아이템에 관련된 연구·강화·잠재 가이드만 연결한다. 추가 이미지 확보를 기다리지 않는다.
- [x] `ItemArtwork`만 클라이언트 컴포넌트로 만든다. 제공 SVG는 정적 도형으로 저장한다. 원격 이미지는 `next/image`와 `https://doj.kr/api/storage-assets/**`에 한정한 `remotePatterns`, `fill`·`sizes`를 사용한다. 실패·이미지 부재 시 기본 표시를 사용한다.
- [x] 위 테스트 PASS 후 커밋한다. 제안 메시지: `feat: add sourced DOJstory item catalog`.

## Task 5: 연구 도감과 선행 및 후속 탐색

**Files:** Create `src/app/dojstory/research/page.tsx`, `src/app/dojstory/research/[slug]/page.tsx`, `src/features/dojstory/components/{ResearchCatalog,ResearchDetails}.tsx`. Test `src/features/dojstory/components/ResearchDetails.test.tsx`.

**Interfaces:** Consumes Task 2 research API와 관계, Task 3 출처 표시. Produces `ResearchCatalog({ research }: { research: WikiResearch[] })`, `ResearchDetails({ research, related }: { research: WikiResearch; related: RelatedLink[] })`.

- [x] `keepsAccessAlternativeSeparateFromPrerequisites`를 작성한다. 결정 압축에 필수 선행 기초 가공, DOJpower 50 이상 또는 가치의 증표 착용, 무료, 30분을 각각 표시한다. 오로라 합성의 선행 연구 결정 압축·광학 분리 I는 모두 필수이며, 가치의 증표 착용으로 선행 연구가 생략되는 표현이 없어야 한다. 자료 수집 계정의 219.99로 해금 가능 여부를 단정하는 배지도 없어야 한다.
- [x] `appliesCorrectedEffectsAndConsumedMaterials`를 작성한다. 오로라 합성에 오로라 프리즘 제작법 해금·별도 조합법 획득 필요가 표시되고, 결정 압축에도 별도 제작법 획득 필요가 남는다. 광학 분리 I·화학공학은 효과 없음으로 표시하고, 화학공학·광학 분리 II 각각의 비용에 기초 과학 연구 키트 10개가 포함되어야 한다.
- [x] 실행: `npm test -- src/features/dojstory/components/ResearchDetails.test.tsx`. FAIL 확인 후 구현한다.
- [x] 현재 확보 연구 12개와 선행·후속 링크를 제공한다. 모든 선행 연구를 필수로 묶고, 별도의 DOJpower 또는 가치의 증표 착용 조건도 충족해야 함을 표시한다. 연구 키트 10개는 소비 재료로서 토큰과 별도 비용 항목에 포함한다.
- [x] PASS 확인 후 커밋한다. 제안 메시지: `feat: add DOJstory process research catalog`.

## Task 6: 공방과 광산 및 설명형 가이드

**Files:** Create `src/app/dojstory/workshop/page.tsx`, `src/app/dojstory/workshop/mines/[slug]/page.tsx`, `src/app/dojstory/guides/[slug]/page.tsx`, `src/features/dojstory/components/{WorkshopOverview,MineDetails,GuideContent}.tsx`. Tests: `src/features/dojstory/components/WorkshopOverview.test.tsx`, `MineDetails.test.tsx`, `GuideContent.test.tsx`.

**Interfaces:** Consumes Task 1 `WikiDataset["workshop"]`, `GuideDocument`와 Task 3 출처 표시. Produces `WorkshopOverview({ workshop }: { workshop: WikiDataset["workshop"] })`, `MineDetails({ mine }: { mine: WikiDataset["workshop"]["mines"][number] })`, `GuideContent({ guide }: { guide: GuideDocument })`.

- [x] `showsWorkshopFactsWithoutProductionSimulation`을 작성한다. 머신 내구도 최대 100·수리팩 회복 20·내구도 0 제작시간 2배·기본 발전량 200kW를 확인한다. 태양광 추가 발전량은 미확인이고 전력 부족 배율은 생성되지 않아야 한다.
- [x] `normalizesMineExperienceAndKeepsUnknownValues`를 작성한다. 구리·철·프리즘 3종과 출처의 시간을 표시하고 레벨 2 비용·필요 경험치는 미확인이다. 기존 레벨 1의 900·레벨 3의 3600은 XP로 표시하고 채굴당 XP와 같은 단위로 관리한다. 개인 효과 여부와 연속 해결 조건의 불확실성도 보존한다.
- [x] `rendersEnhancementTablesWithoutCompletingMissingValues`를 작성한다. 스타포스 10→11 비용 6,798·성공 55%·실패 중 하락 8%와 실제 하락 3.6%·유지 41.4%의 설명을 확인한다. 조건부 확률에 충돌·확인 필요 표시가 없어야 한다. 잠재 등급 상승 12/6/2/0%, 2→최대 4줄, 관찰 옵션 15개를 확인한다. 광산·잠재·DLC의 `?` 값이 0이나 보간값이 되지 않아야 한다.
- [x] 실행: `npm test -- src/features/dojstory/components/WorkshopOverview.test.tsx src/features/dojstory/components/MineDetails.test.tsx src/features/dojstory/components/GuideContent.test.tsx`. FAIL 확인 후 구현한다.
- [x] 구조화된 표와 문단으로 4개 가이드를 작성한다. 스타포스의 기본 확률·최대 단계와 잠재 규칙은 원문 조건을 붙여 표시한다. DLC의 비례·시간 감점 설명은 추정 라벨을 동반한다. 승급시험 보너스 `10 × 성공 개수`는 원문 기재 설명으로 제공하고 자동 계산하지 않는다.
- [x] 반복 가능한 공장이나 조합법 데이터가 있는 것처럼 표시하지 않는다. 단순 공방 탭·광산 상세 링크로 탐색을 제공한다. 긴 표의 모바일 가독성을 확인하고 PASS 후 커밋한다. 제안 메시지: `feat: add DOJstory workshop and enhancement guides`.

## Task 7: 기존 서비스 연결과 전체 검증

**Files:** Modify `src/components/AppHeader.tsx`, `src/components/AppHeader.test.tsx`, `src/app/page.tsx`, `src/app/page.test.tsx`, `src/app/layout.tsx`, `README.md`. Create `src/features/dojstory/components/WikiNavigation.integration.test.tsx`. 필요한 라우트에 metadata 또는 generateMetadata를 추가한다.

**Interfaces:** Consumes Tasks 1–6. 새로운 데이터 API는 추가하지 않는다. 기존 유저·대회 진입 주소를 유지하고 DOJstory 진입만 추가한다.

- [x] 기존 헤더·홈 테스트에 DOJstory `/dojstory` 링크와 기능 카드를 추가하고 기존 유저·대회 링크 검증은 유지한다. 기존 홈의 `2026.08.11 오전 2시`가 분석 데이터 기준임을 분명히 한다. 위키 전체가 그 날짜 기준이라고 표시하지 않는다.
- [x] 통합 테스트 `navigatesCollectedResearchAndItems`를 작성한다. 실제 조회 함수와 데이터로 기초 가공 → 결정 압축 → 베이직 프리즘 최소 항목의 href, 후속·출처 링크를 검증한다. 레시피 상세로 이어지는 가짜 링크가 없어야 한다.
- [x] 통합 테스트 `handlesUnknownSlugsAndSourceFailure`를 작성한다. 없는 item/research/mine/guide/source slug는 404, 로더 실패는 오류 화면, 검색 결과 0개는 정상 빈 결과다. Next.js 프레임워크 함수만 필요한 범위에서 모킹하고 실제 데이터·관계 로직을 대신 만들지 않는다.
- [x] 실행: `npm test -- src/components/AppHeader.test.tsx src/app/page.test.tsx src/features/dojstory/components/WikiNavigation.integration.test.tsx`. 신규 기대가 FAIL하는지 확인 후 연결·메타데이터·README를 구현한다.
- [x] 개발 서버에서 375px·데스크톱 너비, 키보드만 사용하는 탐색, 검색 URL 복사·새로고침, 외부 이미지 실패, 각 상세 진입, 기존 유저·대회 화면을 확인한다. 컴포넌트 통합 테스트는 실제 브라우저 검증을 대체하지 않는다.
- [x] 차례로 `npm test`, `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm run build`를 실행한다. 새 App Router 경로의 `PageProps`를 생성하기 위해 typegen을 타입 검사보다 먼저 한다. 모든 검사 성공과 위 수동 확인 결과를 기록한다.
- [x] 수정한 파일만 커밋한다. 제안 메시지: `feat: integrate DOJstory wiki navigation and docs`. 기존에 미추적 상태였던 사용자 자료는 전체 스테이징하지 말고, 포함할 원문 6개와 보완 자료 1개를 명시적으로 확인해 필요한 시점에만 함께 커밋한다.

## 완료 조건과 후속 자료

첫 배포는 실제 자료로 된 장비 16개·연구 12개·광산 3종과 4개 가이드를 제공하고, 모든 상세에서 원문을 확인할 수 있으면 완료다. 원문에만 이름이 있는 재료·장비는 최소 항목으로 열람 가능해야 한다. 미확인·추정·충돌 정보가 수치 0 또는 공식 확정 사실로 바뀌어서는 안 된다.

다음 자료는 후속 확장을 위한 것이며 위 작업의 선행 조건이 아니다.

- 실제 조합법의 전체 화면: 투입 아이템·수량, 산출 아이템·수량, 시간·전력·해금·소유 조건.
- 광산 레벨 2 등 누락된 비용·필요 경험치, 기본값·현재 보정값의 구분.
- DOJpower의 공식 산식·시간 감점·선정 기준, 미확인 레벨 표와 등급표.
- 누락된 장비 획득처·이미지·원문 확인일, 전체 잠재 옵션 풀과 실제 아이템별 예외. 비배경 장비 AI 여부는 추가 수집 대상이 아니다.

후속 자료를 확보하면 해당 값과 근거를 교체·추가한다. 전체 위키를 재작성하거나 가상 레시피를 먼저 넣는 방식으로 진행하지 않는다.

## 자체 검토 결과

최초 설계의 아이템·연구·출처·공방·설명형 가이드는 Tasks 1–7에 배정했다. 조합법 도감·변경 기록·개인 연동·계산기는 현재 자료 범위에 맞춰 명시적으로 보류했다. Review Focus의 5개 항목은 각 소유 Task의 검증 단계에 연결했고, 함수명과 타입은 공통 인터페이스에 맞췄다. 사용자 보완에 따라 정규화 결정·화면 요구·검증 기대·후속 요청 목록을 함께 갱신했다. 계획 작성 단계에서는 구현 코드와 기존 원문 6개를 변경하지 않았다.

## 구현·검증 결과 (2026-10-22 KST)

- Tasks 1–7 구현. 기존 원문 6개와 보완 자료 1개는 그대로 보존했다.
- 전체 테스트 50개 파일, 233개 통과. `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm run build` 통과.
- 배포 서버에서 `scripts/check-dojstory-routes.mjs`로 정상 화면 16개, 미등록 상세 5종의 HTTP 404, 빈 검색의 정상 200 응답을 확인했다.
- 브라우저에서 1365px·375px, 별칭 검색·GET URL 새로고침, 키보드 연구→아이템→원문 탐색, 광산·강화 표의 내부 가로 스크롤, 장비·연구·공방·광산·가이드·출처 화면, 기존 유저·대회 분석 진입을 확인했다.
- 실제 ItemArtwork를 사용하는 임시 개발용 검증 화면에서 원격 이미지 실패 시 이름·기본 표시·상세 링크가 유지됨을 확인한 뒤 검증 화면을 제거했다.
- 브라우저 검증에서 광산 표가 페이지 전체 너비를 늘리는 문제를 발견해 grid의 최소 너비를 수정했다.
- 상세는 로컬 수록 항목을 빌드 시 생성하고 미등록 경로는 실제 HTTP 404를 반환하도록 구성했다. 새 항목을 추가할 때 다시 빌드한다. 공통 404 화면에는 위키 검색 진입을 추가했다.
- 변경은 `codex/dojstory-wiki` 작업 브랜치에 기록한다.
- 별도 읽기 전용 코드 리뷰에서 차단할 결함은 발견되지 않았다. 알려진 공방 사용처로의 역방향 연결 누락은 탐색 요구를 완성하기 위해 보완했다. 철 주괴·수리팩·태양광 패널의 공방 사용처와 원문 링크를 정규 참조에 추가하고 회귀 테스트의 실패→통과 및 실제 브라우저 탐색을 확인했다.
- 작업 공간은 현재 폴더의 새 브랜치를 사용했다. 별도 worktree가 필요하면 변경을 옮길 수 있다. 조합법 도감·계산기·계정 상태·변경 기록은 계획의 후속 범위를 유지한다. 자료 정확성은 제공 자료와 그 확인일을 기준으로 하므로 게임 변경이 위키보다 앞설 수 있다. 리뷰는 코드·원문 대조를 맡고, 최종 실행 검증은 구현 담당자가 다시 수행했다.
