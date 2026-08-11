import { describe, expect, it } from "vitest";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";

const markdown = `# DOJ Beginner Contest 4 대회 정보
## 기본정보
- 링크: https://doj.kr/ko/contests/doj-beginner-contest-4
- 문제순서: 난이도순
- 레이티드 참가자 범위: ~2400
- 운영진
  - 총괄: [admin, 1352](https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h)
  - 출제: [lunarlity, 1280](https://doj.kr/ko/user/cmoh8o181003i89jvd67yd4ca)
- 대회 시작시간: 2026년 7월 8일 오후 9:00
- 대회 종료시간: 2026년 7월 8일 오후 10:40
- 대회 참가 타입: 일반
- 대회 제한 시간: 100분

## 대회 참가자/스코어보드
./contest_score_board.json 참고, rating은 각 유저의 대회 참가전 레이팅, 퍼포먼스가 -인건 언레이티드 참가 유저

## 문제
### [A, 두 수열](https://doj.kr/ko/problems/342)
- 난이도: B1
- 최초 만점(FF): [jkrt, 2369](https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh) (0m 55s)

### [B, 계단 수열 만들기](https://doj.kr/ko/problems/343)
- 난이도: B2
- FF: [cenix820, 2052](https://doj.kr/ko/user/cmordu9f2001wse16r3jay8w4) (1m 16s)

### [C, Yet Another Convex Hull Problem](https://doj.kr/ko/problems/344)
- 난이도: S4
- FF: [RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (3m 54s)

### [D, 직사각형 1](https://doj.kr/ko/problems/345)
- 난이도: G5
- FF: [RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (7m 29s)

### [E, 트리 뽑아내기](https://doj.kr/ko/problems/346)
- 난이도: G2
- FF: [RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (10m 36s)

### [F, 보물찾기](https://doj.kr/ko/problems/347)
- 난이도: P4
- FF: [plast, 2286](https://doj.kr/ko/user/cmolny8hj0053unpdl5zz2rqc) (32m 31s)

### [G, 원형 순열 정렬](https://doj.kr/ko/problems/348)
- 난이도: P4
- FF: [RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (19m 0s)

### [H, 쉬운 문자열 문제](https://doj.kr/ko/problems/349)
- 난이도: D5
- FF: [platter, 2603](https://doj.kr/ko/user/cmps2k3v300kdeog07f22z0pz) (61m 18s)

### [I, 직사각형 2](https://doj.kr/ko/problems/350)
- 난이도: D2
- FF: -`;

const linkedProblemCases = [
  {
    index: "A",
    href: "https://doj.kr/ko/problems/342",
    firstFull: {
      handle: "jkrt",
      rating: 2369,
      href: "https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh",
      time: "0m 55s",
    },
  },
  {
    index: "B",
    href: "https://doj.kr/ko/problems/343",
    firstFull: {
      handle: "cenix820",
      rating: 2052,
      href: "https://doj.kr/ko/user/cmordu9f2001wse16r3jay8w4",
      time: "1m 16s",
    },
  },
  {
    index: "C",
    href: "https://doj.kr/ko/problems/344",
    firstFull: {
      handle: "RreShi",
      rating: 1777,
      href: "https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w",
      time: "3m 54s",
    },
  },
  {
    index: "D",
    href: "https://doj.kr/ko/problems/345",
    firstFull: {
      handle: "RreShi",
      rating: 1777,
      href: "https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w",
      time: "7m 29s",
    },
  },
  {
    index: "E",
    href: "https://doj.kr/ko/problems/346",
    firstFull: {
      handle: "RreShi",
      rating: 1777,
      href: "https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w",
      time: "10m 36s",
    },
  },
  {
    index: "F",
    href: "https://doj.kr/ko/problems/347",
    firstFull: {
      handle: "plast",
      rating: 2286,
      href: "https://doj.kr/ko/user/cmolny8hj0053unpdl5zz2rqc",
      time: "32m 31s",
    },
  },
  {
    index: "G",
    href: "https://doj.kr/ko/problems/348",
    firstFull: {
      handle: "RreShi",
      rating: 1777,
      href: "https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w",
      time: "19m 0s",
    },
  },
  {
    index: "H",
    href: "https://doj.kr/ko/problems/349",
    firstFull: {
      handle: "platter",
      rating: 2603,
      href: "https://doj.kr/ko/user/cmps2k3v300kdeog07f22z0pz",
      time: "61m 18s",
    },
  },
  {
    index: "I",
    href: "https://doj.kr/ko/problems/350",
    firstFull: null,
  },
] as const;

describe("parseContestInfo", () => {
  it("preserves linked contest, staff, problem, and first-full metadata", () => {
    const parsed = parseContestInfo(markdown);

    expect(parsed.contest.href).toBe("https://doj.kr/ko/contests/doj-beginner-contest-4");
    expect(parsed.contest.director).toEqual({
      handle: "admin",
      rating: 1352,
      href: "https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h",
    });
    expect(parsed.contest.setter).toEqual({
      handle: "lunarlity",
      rating: 1280,
      href: "https://doj.kr/ko/user/cmoh8o181003i89jvd67yd4ca",
    });
    expect(parsed.problems).toHaveLength(9);
    expect(parsed.problems[0]).toMatchObject({
      index: "A",
      title: "두 수열",
      tier: { label: "Bronze I", shortLabel: "B1" },
    });
    expect(parsed.problems[8]).toMatchObject({
      index: "I",
      tier: { label: "Diamond II", shortLabel: "D2" },
    });
  });

  it.each(linkedProblemCases)(
    "preserves problem $index linked profile metadata exactly",
    ({ index, href, firstFull }) => {
      const parsed = parseContestInfo(markdown);
      const problem = parsed.problems.find((candidate) => candidate.index === index);

      expect(problem?.href).toBe(href);
      expect(problem?.firstFull).toEqual(firstFull);
    },
  );

  it("normalizes the window participation type without changing its schedule", () => {
    const result = parseContestInfo(markdown.replace("대회 참가 타입: 일반", "대회 참가 타입: window"));

    expect(result.contest.participationType).toBe("window");
    expect(result.contest.durationMinutes).toBe(100);
    expect(result.contest.startAt).toBe("2026-07-08T21:00:00+09:00");
    expect(result.contest.endAt).toBe("2026-07-08T22:40:00+09:00");
  });

  it("rejects an HTTP contest URL with field context", () => {
    const invalidMarkdown = markdown.replace(
      "https://doj.kr/ko/contests/doj-beginner-contest-4",
      "http://doj.kr/ko/contests/doj-beginner-contest-4",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: .*링크/);
  });

  it("rejects a contest URL in a user field", () => {
    const invalidMarkdown = markdown.replace(
      "https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h",
      "https://doj.kr/ko/contests/doj-beginner-contest-4",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: .*총괄/);
  });

  it("rejects a user URL in a problem field", () => {
    const invalidMarkdown = markdown.replace(
      "https://doj.kr/ko/problems/342",
      "https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: problem A .*link/);
  });

  it.each([
    ["negative", "-1"],
    ["non-integer", "1352.5"],
  ])("rejects a %s profile rating", (_case, rating) => {
    const invalidMarkdown = markdown.replace("[admin, 1352]", `[admin, ${rating}]`);

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: .*총괄/);
  });

  it("rejects an unsafe-integer profile rating", () => {
    const invalidMarkdown = markdown.replace(
      "[admin, 1352]",
      "[admin, 9007199254740992]",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(
      /contest_info\.md: field "총괄" has invalid rating "9007199254740992"/,
    );
  });

  it.each(["admin staff", "[admin", "<admin>", "admin*"])(
    "rejects invalid staff handle %s with field context",
    (handle) => {
      const invalidMarkdown = markdown.replace("[admin, 1352]", `[${handle}, 1352]`);

      expect(() => parseContestInfo(invalidMarkdown)).toThrow(
        /contest_info\.md: field "총괄" has invalid handle/,
      );
    },
  );

  it.each(["jk rt", "*jkrt*", "<jkrt>"])(
    "rejects invalid first-full handle %s with problem context",
    (handle) => {
      const invalidMarkdown = markdown.replace("[jkrt, 2369]", `[${handle}, 2369]`);

      expect(() => parseContestInfo(invalidMarkdown)).toThrow(
        /contest_info\.md: problem A FF has invalid handle/,
      );
    },
  );

  it("accepts DOJ handles containing letters, digits, and underscores", () => {
    const parsed = parseContestInfo(
      markdown.replace("[admin, 1352]", "[rich_chanel4u, 1352]"),
    );

    expect(parsed.contest.director.handle).toBe("rich_chanel4u");
  });

  it("rejects a missing problem link", () => {
    const invalidMarkdown = markdown.replace(
      "### [A, 두 수열](https://doj.kr/ko/problems/342)",
      "### A, 두 수열",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: problem A .*link/);
  });

  it("rejects malformed first-full Markdown", () => {
    const invalidMarkdown = markdown.replace(
      "[RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (3m 54s)",
      "[[RreShi, 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w), 1777](https://doj.kr/ko/user/cmozmyjdx00r111qkc0ecc12w) (3m 54s)",
    );

    expect(() => parseContestInfo(invalidMarkdown)).toThrow(/contest_info\.md: .*problem C/);
  });

  it.each([
    [
      "duplicate problem index",
      markdown.replace("[B,", "[A,"),
      /contest_info\.md: duplicate problem index "A"/,
    ],
    [
      "missing difficulty",
      markdown.replace("- 난이도: B1\n", ""),
      /contest_info\.md: problem A is missing 난이도/,
    ],
    [
      "missing title",
      markdown.replace("[A, 두 수열]", "[A, ]"),
      /contest_info\.md: problem A is missing its title/,
    ],
    [
      "fewer than nine problems",
      markdown.replace(/### \[I,[\s\S]*$/, ""),
      /contest_info\.md: expected problem indices A, B, C, D, E, F, G, H, I in order/,
    ],
    [
      "invalid calendar time",
      markdown.replace("2026년 7월 8일 오후 9:00", "2026년 2월 30일 오후 9:00"),
      /contest_info\.md: invalid contest date-time "2026년 2월 30일 오후 9:00"/,
    ],
  ])("rejects %s with source and field details", (_case, invalidMarkdown, errorPattern) => {
    expect(() => parseContestInfo(invalidMarkdown)).toThrow(errorPattern);
  });

  it.each([
    [
      "reordered A through I indices",
      markdown
        .replace("[A,", "[TEMP,")
        .replace("[B,", "[A,")
        .replace("[TEMP,", "[B,"),
    ],
    ["A through H followed by J", markdown.replace("[I,", "[J,")],
    [
      "an extra tenth problem",
      `${markdown}\n\n### [J, Extra](https://doj.kr/ko/problems/351)\n- 난이도: B1\n- FF: -\n`,
    ],
    ["a missing middle index", markdown.replace(/### \[D,[\s\S]*?(?=### \[E,)/, "")],
  ])("rejects %s", (_case, invalidMarkdown) => {
    expect(() => parseContestInfo(invalidMarkdown)).toThrow(
      /contest_info\.md: expected problem indices A, B, C, D, E, F, G, H, I in order/,
    );
  });
});
