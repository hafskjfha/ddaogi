# 따오기

DOJ 유저·대회 기록과 DOJstory 정보를 살펴볼 수 있는 비공식 서드파티 사이트입니다. 유저·대회 분석은 저장소의 mock 데이터로 시연하며, DOJstory 위키는 사용자가 제공한 실제 자료를 전사한 도감입니다.

## 주요 기능

- 유저의 레이팅 변화, 대회 이력과 참가 스트릭 분석
- 문제 풀이 현황, 난이도·언어 분포와 풀이 스트릭 제공
- 대회 참가자 레이팅 분포와 문제별 결과 분석
- DOJstory 장비 16개, 공정연구 12개, 광산 3종과 가이드 4개 (현재 수록분)
- 이름·별칭·장비 부위 검색, 연구 선행 관계 DAG와 아이템의 양방향 탐색, 원문 열람
- 반응형 UI와 ~~다크 모드 지원~~

## 기술 스택

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- Recharts · Radix UI · Lucide React
- Vitest · Testing Library

## 시작하기

Node.js `20.19+`, `22.13+` 또는 `24+`와 npm이 필요합니다.

```bash
npm install
npm run dev
```

개발 서버가 시작되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

프로젝트 검증 명령은 다음과 같습니다.

```bash
npm test
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
```

## 주요 경로

| 경로 | 설명 |
| --- | --- |
| `/` | 프로젝트 소개 및 데모 진입 화면 |
| `/users` | 지원하는 유저 검색 및 목록 |
| `/users/jtw7913` | 유저 분석 데모 |
| `/contests` | 지원하는 대회 목록 |
| `/contests/doj-beginner-contest-4` | 대회 분석 데모 |
| `/dojstory` | 위키 전체 검색과 자료 상태 |
| `/dojstory/items`, `/dojstory/items/[slug]` | 장비·이름만 확보한 아이템 도감 |
| `/dojstory/research`, `/dojstory/research/[slug]` | 공정연구와 선행·후속 탐색 |
| `/dojstory/workshop` | 머신·전력·광산 개요 |
| `/dojstory/workshop/mines/[slug]` | copper, iron, prism 광산 상세 |
| `/dojstory/guides/[slug]` | getting-started, dlc-dojpower, starforce, potential |
| `/dojstory/sources/[sourceId]` | 원문 6개와 보완 자료 1개의 텍스트 열람 |

## 데이터 안내

유저·대회 분석은 외부 API 대신 `data/` 디렉터리의 Markdown과 JSON 목 데이터를 사용합니다. 분석 데이터 기준 시점은 `2026-08-11 02:00 KST`이며 실시간으로 갱신되지 않습니다.

DOJstory 원문은 `docs/dojstory-data/`에 보존하고 타입 검사되는 정규 데이터는 `data/dojstory/`에서 관리합니다. `clarifications.md`의 사용자 보완을 같은 항목의 우선 근거로 적용합니다. 자료 확인 시점은 DLC `2026-10-21 23:00`, 연구 `2026-10-22 00:00`, 공방 `00:35`, 스타포스 `01:21 KST`입니다. 장비·잠재 원문의 확인일은 미확인입니다. 보완일을 전체 자료 확인일로 대체하지 않습니다.

`sourced`는 제공 자료에 기재되었다는 뜻이며 공식 검증 완료를 의미하지 않습니다. `unknown`, `tentative`, `not-applicable`, `conflict` 상태를 별도로 관리합니다. 원문을 수정하거나 누락 값을 0으로 채우지 않습니다. 항목을 갱신할 때 근거와 필드별 상태를 함께 수정하고 참조 검증·테스트·타입 검사·빌드를 실행하세요.

검색·필터는 GET URL에 저장됩니다. 예: `/dojstory?q=기초가공&kind=research`, `/dojstory/items?slot=chair`. 반복 쿼리는 첫 값만 사용합니다. 원문은 7개의 고정 허용 목록에서만 읽고 HTML·SVG도 텍스트로 표시합니다. 원격 장비 이미지는 `https://doj.kr/api/storage-assets/**`만 허용하며 실패 시 이름과 기본 표시를 유지합니다.

위키는 부분 수록 자료입니다. 전체 연구 트리·제작 레시피·업데이트 기록·개인 계정 연동·해금 판정·게임 조작·계산기는 이번 범위에 포함하지 않습니다. 상세 계획은 [구현 계획](docs/dojstory-implementation-plan.md)을 참고하세요.

빌드 후 `npm start`로 서버를 실행한 상태에서 `node scripts/check-dojstory-routes.mjs`로 실제 상세 응답, 원문 이스케이프와 미등록 주소의 HTTP 404를 검사할 수 있습니다. 다른 포트는 `DOJSTORY_BASE_URL` 환경 변수로 지정합니다. 수록 상세는 빌드 시 생성하며 새 항목을 추가하면 다시 빌드합니다.

## 안내

따오기는 DOJ에서 운영하거나 공식적으로 승인한 서비스가 아닌 개인 제작 프로젝트입니다. 화면에 표시되는 통계와 예상 레이팅은 공식 정보가 아닙니다.
