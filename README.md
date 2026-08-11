# 따오기

DOJ 유저와 대회를 깊이 읽는 서드파티 분석 대시보드입니다. Next.js App Router의 Server Component에서 로컬 목 데이터를 읽고, 직렬화 가능한 분석 DTO를 Client Component 차트와 인터랙션에 전달합니다.

## 경로 상태

- `/`: 따오기 소개, 비공식 사이트 및 데이터 기준 시점 안내, 상세 데모 링크를 제공합니다.
- `/users`: `jtw7913` 전용 검색과 지원 프로필 링크를 제공합니다.
- `/users/jtw7913`: 유저 프로필, 레이팅 이력, 문제 풀이, 추가 통계를 제공합니다.
- `/contests`: 페이지당 20개 구조의 대회 목록을 제공하며 현재 한 개 대회를 지원합니다.
- `/contests/doj-beginner-contest-4`: 대회 개요, rated 참가자 분포, 문제별 분석을 제공합니다.

지원하지 않는 유저·대회 경로에는 한국어 404 화면이 표시됩니다. 두 동적 분석 경로에는 로딩 화면과 다시 시도할 수 있는 오류 화면이 있습니다.

## 요구사항 구현 지도

| 요구 기능 | 경로 | 목 데이터 | 주요 구현 |
| --- | --- | --- | --- |
| 프로필 이미지·플랜카드 fallback, 소개, 현재/max 레이팅, 칭호, 순위·백분위 | `/users/jtw7913` | `data/user_info.md` | `src/features/user/components/UserProfileHero.tsx` |
| 레이팅·퍼포먼스 그래프, 칭호 band, hover/focus 상세 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/RatingOverview.tsx`, `RatingHistoryChart.tsx` |
| 최신순 대회 이력, unrated·티어 변화 없음 표기 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/ContestHistoryTable.tsx` |
| 참가 대회 좌표 스트릭과 현재·최장 연속 | `/users/jtw7913`의 `레이팅` 탭 | `data/user_info.md` | `src/features/user/components/ContestStreak.tsx` |
| 만점·미만 문제 목록, 난이도·점수 tooltip, DOJ 문제 링크 | `/users/jtw7913`의 `문제` 탭 | `data/result.json`, `data/difficulty.json` | `src/features/user/components/ProblemList.tsx` |
| KST 문제 풀이 일자 스트릭, 총 만점 수·랭킹, source 기반 문제 수 | `/users/jtw7913`의 `문제` 탭 | `data/result.json`, `data/problems.json` | `src/features/user/components/ProblemSolveStreak.tsx`, `ProblemOverview.tsx` |
| U/B/S/G/P/D/R 난이도 분포와 세부 난이도 전환 | `/users/jtw7913`의 `문제` 탭 | `data/result.json`, `data/difficulty.json`, `data/problems.json` | `src/features/user/components/DifficultyDistribution.tsx` |
| 언어별 제출, 총 제출·언어 수, 대회 1등·퍼솔 | `/users/jtw7913`의 `기타 정보` 탭 | `data/result.json`, `data/user_info.md` | `src/features/user/components/MoreOverview.tsx`, `LanguageDistribution.tsx` |
| 대회 링크, 일정·제한 시간·rated 범위, 레이팅이 포함된 운영진 링크, 일반/window 설명 | `/contests/doj-beginner-contest-4` | `data/contest_info.md` | `src/features/contest/components/ContestHero.tsx`, `ParticipationTypeTooltip.tsx` |
| rated 참가자 최솟값·Q1·중앙값·Q3·최댓값 | `/contests/doj-beginner-contest-4` | `data/contest_score_board.json` | `src/features/contest/components/RatingQuartiles.tsx` |
| A–I 문제·FF 링크/레이팅, 없음 상태, 관측 점수별 IRT 예상 레이팅과 산출식 tooltip | `/contests/doj-beginner-contest-4` | `data/contest_info.md`, `data/contest_score_board.json` | `src/features/contest/components/ContestProblemAnalysis.tsx`, `ScoreEstimateGrid.tsx`, `ScoreEstimateHelp.tsx` |
| 지원하지 않는 handle·slug의 한국어 404 | `/users/[handle]`, `/contests/[contestSlug]` | 지원 slug/handle 검사 | `src/app/not-found.tsx` |
| 로딩 skeleton과 오류 재시도·지원 경로 복구 | `/users/[handle]`, `/contests/[contestSlug]` | 각 서버 loader | 각 동적 경로의 `loading.tsx`, `error.tsx` |

## 데이터 소스

화면 데이터는 외부 API가 아니라 저장소의 `data/` 디렉터리에 있는 Markdown과 JSON 목 파일에서 읽습니다. 유저 대시보드는 `data/user_info.md`, `data/result.json`, `data/difficulty.json`, `data/problems.json`을, 대회 대시보드는 `data/contest_info.md`, `data/contest_score_board.json`을 파싱하고 검증된 DTO로 정규화해 구성합니다. 제출 시각은 원본 instant를 보존하면서 풀이 일자·일별 개수·스트릭 경계에는 `Asia/Seoul` 달력 날짜를 사용합니다. 대회·문제·운영진·FF URL과 운영진·FF 레이팅도 `contest_info.md`에서 종류별로 검증해 화면 링크와 색상에 반영합니다.

문제별 표시 점수는 `data/contest_score_board.json`의 0점 초과·100점 미만 부분점수 표본에서 25·50·75% 최근접 순위 사분위값을 고르고 중복을 제거한 뒤 100점을 항상 추가해 정합니다. 각 점수의 예상 레이팅 `d`는 rated 참가자의 대회 전 레이팅 `r`과 해당 점수 달성 여부를 모두 사용하며, 성공 확률을 `1 / (1 + 6^((d - r) / 400))`로 두었을 때 예상 달성자 수가 실제 달성자 수와 같아지는 지점을 이분 탐색한 값입니다. 달성자 또는 미달자가 없어 유한한 값을 식별할 수 없으면 `-`로 표시합니다. DOJ가 발표한 공식 레이팅이나 공식 문제 난이도가 아니며, 같은 내용은 예상 레이팅 열의 키보드·포인터 접근 가능한 도움말에서도 확인할 수 있습니다.

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
