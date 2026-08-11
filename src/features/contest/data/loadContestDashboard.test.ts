import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadContestDashboard } from "@/features/contest/data/loadContestDashboard";

const markdown = readFileSync(resolve(process.cwd(), "data/contest_info.md"), "utf8");
const scoreboardText = readFileSync(
  resolve(process.cwd(), "data/contest_score_board.json"),
  "utf8",
);
let fixtureRoot = "";

beforeEach(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), "ddaogi-contest-loader-"));
  mkdirSync(join(fixtureRoot, "data"));
  vi.spyOn(process, "cwd").mockReturnValue(fixtureRoot);
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(fixtureRoot, { recursive: true, force: true });
});

describe("loadContestDashboard", () => {
  it("returns null for an unsupported slug", async () => {
    await expect(loadContestDashboard("unknown")).resolves.toBeNull();
  });

  it("loads and validates the supported contest source files", async () => {
    writeContestSources(markdown, scoreboardText);
    const dashboard = await loadContestDashboard("doj-beginner-contest-4");

    expect(dashboard).toMatchObject({
      contest: {
        slug: "doj-beginner-contest-4",
        href: "https://doj.kr/ko/contests/doj-beginner-contest-4",
        director: {
          handle: "admin",
          rating: 1352,
          href: "https://doj.kr/ko/user/cmo8c9i8g000gw1uq9yc30h8h",
        },
      },
      ratedParticipantCount: 39,
    });
    expect(dashboard?.problems).toHaveLength(9);
    expect(dashboard?.problems[0]).toMatchObject({
      href: "https://doj.kr/ko/problems/342",
      firstFull: {
        handle: "jkrt",
        rating: 2369,
        href: "https://doj.kr/ko/user/cmorx2455005q5f7m2wqvcewh",
        time: "0m 55s",
      },
    });
  });

  it("names the scoreboard source when JSON syntax is invalid", async () => {
    writeContestSources(markdown, "{");

    await expect(loadContestDashboard("doj-beginner-contest-4")).rejects.toThrow(
      /contest_score_board\.json: .*JSON/,
    );
  });

  it("names the scoreboard source while preserving validation details", async () => {
    writeContestSources(markdown, "{}");

    await expect(loadContestDashboard("doj-beginner-contest-4")).rejects.toThrow(
      /contest_score_board\.json: Invalid contest scoreboard: expected an array/,
    );
  });

  it("does not relabel contest-info parsing failures as scoreboard failures", async () => {
    writeContestSources(markdown.replace("### [I,", "### [J,"), scoreboardText);
    let caughtError: Error | null = null;

    try {
      await loadContestDashboard("doj-beginner-contest-4");
    } catch (error) {
      if (error instanceof Error) caughtError = error;
    }

    expect(caughtError?.message).toMatch(/contest_info\.md/);
    expect(caughtError?.message).not.toMatch(/contest_score_board\.json/);
  });
});

function writeContestSources(markdownSource: string, scoreboardSource: string): void {
  writeFileSync(join(fixtureRoot, "data", "contest_info.md"), markdownSource, "utf8");
  writeFileSync(
    join(fixtureRoot, "data", "contest_score_board.json"),
    scoreboardSource,
    "utf8",
  );
}
