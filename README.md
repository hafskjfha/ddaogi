# 따오기

DOJ 유저와 대회를 깊이 읽는 서드파티 분석 대시보드입니다. Next.js App Router의 Server Component에서 로컬 목 데이터를 읽고, 직렬화 가능한 분석 DTO를 Client Component 차트와 인터랙션에 전달합니다.

## 경로 상태

- `/users/jtw7913`: 유저 프로필, 레이팅 이력, 문제 풀이, 추가 통계를 제공합니다.
- `/contests/doj-beginner-contest-4`: 대회 개요, rated 참가자 분포, 문제별 분석을 제공합니다.
- `/`: 지원 유저 대시보드인 `/users/jtw7913`으로 이동합니다.

지원하지 않는 유저·대회 경로에는 한국어 404 화면이 표시됩니다. 두 동적 분석 경로에는 로딩 화면과 다시 시도할 수 있는 오류 화면이 있습니다.

## 요구사항 구현 지도

| 요구 기능 | 경로 | 목 데이터 | 주요 구현 |
| --- | --- | --- | --- |
| 프로필 이미지·플랜카드 fallback, 현재/max 레이팅, 칭호, 순위·백분위 | `/users/jtw7913` | `data/user_info.md` | `src/features/user/components/UserProfileHero.tsx` |
| 레이팅·퍼포먼스 그래프, 칭호 band, hover/focus 상세 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/RatingOverview.tsx`, `RatingHistoryChart.tsx` |
| 최신순 대회 이력, unrated·티어 변화 없음 표기 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/ContestHistoryTable.tsx` |
| 참가 대회 좌표 스트릭과 현재·최장 연속 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/ContestStreak.tsx` |
| 만점·미만 문제 목록, 난이도·점수 tooltip, DOJ 문제 링크 | `/users/jtw7913`의 `문제` 탭 | `data/result.json`, `data/difficulty.json` | `src/features/user/components/ProblemList.tsx` |
| 문제 풀이 일자 스트릭, 총 만점 수·랭킹 제공 상태 | `/users/jtw7913`의 `문제` 탭 | `data/result.json` | `src/features/user/components/ProblemSolveStreak.tsx`, `ProblemOverview.tsx` |
| U/B/S/G/P/D/R 난이도 분포와 세부 난이도 전환 | `/users/jtw7913`의 `문제` 탭 | `data/result.json`, `data/difficulty.json` | `src/features/user/components/DifficultyDistribution.tsx` |
| 언어별 제출, 총 제출·언어 수, 대회 1등·퍼솔 | `/users/jtw7913`의 `기타 정보` 탭 | `data/result.json`, `data/user_info.md` | `src/features/user/components/MoreOverview.tsx`, `LanguageDistribution.tsx` |
| 대회 일정·제한 시간·rated 범위·운영진·일반/window 설명 | `/contests/doj-beginner-contest-4` | `data/contest_info.md` | `src/features/contest/components/ContestHero.tsx`, `ParticipationTypeTooltip.tsx` |
| rated 참가자 최솟값·Q1·중앙값·Q3·최댓값 | `/contests/doj-beginner-contest-4` | `data/contest_score_board.json` | `src/features/contest/components/RatingQuartiles.tsx` |
| A–I 문제 난이도, FF와 없음 상태, 25/50/75/100% 예상 레이팅 | `/contests/doj-beginner-contest-4` | `data/contest_info.md`, `data/contest_score_board.json` | `src/features/contest/components/ContestProblemAnalysis.tsx`, `ScoreEstimateGrid.tsx` |
| 지원하지 않는 handle·slug의 한국어 404 | `/users/[handle]`, `/contests/[contestSlug]` | 지원 slug/handle 검사 | `src/app/not-found.tsx` |
| 로딩 skeleton과 오류 재시도·지원 경로 복구 | `/users/[handle]`, `/contests/[contestSlug]` | 각 서버 loader | 각 동적 경로의 `loading.tsx`, `error.tsx` |

## 데이터 소스

화면 데이터는 외부 API가 아니라 저장소의 `data/` 디렉터리에 있는 Markdown과 JSON 목 파일에서 읽습니다. 유저 대시보드는 `data/user_info.md`, `data/result.json`, `data/difficulty.json`을, 대회 대시보드는 `data/contest_info.md`, `data/contest_score_board.json`을 파싱하고 검증된 DTO로 정규화해 구성합니다.

문제별 예상 레이팅은 제공된 `data/contest_score_board.json`에서 각 점수 기준을 충족한 rated 참가자의 대회 전 레이팅 중앙값을 10 단위로 반올림한 추정치입니다. DOJ가 발표한 공식 레이팅이나 공식 문제 난이도가 아닙니다. 표본에 해당 참가자가 없으면 `-`로 표시하며, 숫자 추정치는 25%에서 100%까지 감소하지 않도록 보정합니다.

## 개발 및 검증

개발 서버를 실행합니다.

```bash
npm run dev
```

변경 사항은 다음 명령으로 검증합니다.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
