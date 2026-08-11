# 따오기

DOJ 유저와 대회 기록을 한눈에 살펴볼 수 있는 비공식 서드파티 분석 대시보드입니다. 현재는 저장소에 포함된 목 데이터를 사용해 유저 및 대회 분석 기능을 시연합니다.

## 주요 기능

- 유저의 레이팅 변화, 대회 이력과 참가 스트릭 분석
- 문제 풀이 현황, 난이도·언어 분포와 풀이 스트릭 제공
- 대회 참가자 레이팅 분포와 문제별 결과 분석
- 반응형 UI와 다크 모드 지원

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

## 데이터 안내

화면은 외부 API 대신 `data/` 디렉터리의 Markdown과 JSON 목 데이터를 사용합니다. 데이터 기준 시점은 `2026-08-11 02:00 KST`이며 실시간으로 갱신되지 않습니다.

## 안내

따오기는 DOJ에서 운영하거나 공식적으로 승인한 서비스가 아닌 개인 제작 프로젝트입니다. 화면에 표시되는 통계와 예상 레이팅은 공식 정보가 아닙니다.
