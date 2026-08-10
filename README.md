# 따오기

DOJ 유저와 대회를 깊이 읽는 서드파티 분석 대시보드입니다. Next.js App Router의 Server Component에서 로컬 목 데이터를 읽고, 직렬화 가능한 분석 DTO를 Client Component 차트와 인터랙션에 전달합니다.

## 경로 상태

- `/users/jtw7913`: 현재 지원하며 유저 프로필, 레이팅 이력, 문제 풀이, 추가 통계를 제공합니다.
- `/contests/doj-beginner-contest-4`: 대회 분석용 예정 URL입니다. 대회 대시보드 계획이 구현되기 전까지는 현재 이용할 수 없습니다.
- `/`: 지원 유저 대시보드인 `/users/jtw7913`으로 이동합니다.

지원하지 않는 유저 경로와 아직 구현되지 않은 대회 분석 경로에는 한국어 404 화면이 표시됩니다.

## 데이터 소스

화면 데이터는 외부 API가 아니라 저장소의 `data/` 디렉터리에 있는 Markdown과 JSON 목 파일에서 읽습니다. 유저 대시보드는 `data/user_info.md`, `data/result.json`, `data/difficulty.json`을 파싱하고 정규화해 구성합니다.

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
