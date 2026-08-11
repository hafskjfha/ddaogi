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

import { loadUserDashboard } from "@/features/user/data/loadUserDashboard";

const markdown = readFileSync(resolve(process.cwd(), "data/user_info.md"), "utf8");
const resultsText = readFileSync(resolve(process.cwd(), "data/result.json"), "utf8");
const difficultyText = readFileSync(resolve(process.cwd(), "data/difficulty.json"), "utf8");
const problemsText = readFileSync(resolve(process.cwd(), "data/problems.json"), "utf8");
let fixtureRoot = "";

beforeEach(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), "ddaogi-user-loader-"));
  mkdirSync(join(fixtureRoot, "data"));
  vi.spyOn(process, "cwd").mockReturnValue(fixtureRoot);
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(fixtureRoot, { recursive: true, force: true });
});

describe("loadUserDashboard", () => {
  it("names only result.json when its JSON syntax is invalid", async () => {
    writeUserSources(markdown, "{", difficultyText, problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/result\.json/);
    expect(error.message).not.toMatch(/difficulty\.json/);
    expectWrappedJsonSyntaxError(error);
  });

  it("names only difficulty.json when its JSON syntax is invalid", async () => {
    writeUserSources(markdown, resultsText, "{", problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/difficulty\.json/);
    expect(error.message).not.toMatch(/result\.json/);
    expectWrappedJsonSyntaxError(error);
  });

  it("names problems.json and preserves the original JSON syntax error as its cause", async () => {
    writeUserSources(markdown, resultsText, difficultyText, "{");

    const error = await captureLoadError();

    expect(error.message).toMatch(/problems\.json/);
    expect(error.message).not.toMatch(/result\.json|difficulty\.json/);
    expectWrappedJsonSyntaxError(error);
  });

  it("names only result.json when its structure is invalid", async () => {
    writeUserSources(markdown, "[]", difficultyText, problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/result\.json/i);
    expect(error.message).toMatch(/expected a problem record/i);
    expect(error.message).not.toMatch(/difficulty\.json/);
  });

  it("names only difficulty.json when its structure is invalid", async () => {
    writeUserSources(markdown, resultsText, "[]", problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/difficulty\.json/i);
    expect(error.message).toMatch(/expected a problem record/i);
    expect(error.message).not.toMatch(/result\.json/);
  });

  it("names only problems.json when its structure is invalid", async () => {
    writeUserSources(markdown, resultsText, difficultyText, "[]");

    const error = await captureLoadError();

    expect(error.message).toMatch(/problems\.json/i);
    expect(error.message).toMatch(/record/i);
    expect(error.message).not.toMatch(/result\.json|difficulty\.json/);
  });

  it("preserves result.json problem details for a malformed record", async () => {
    writeUserSources(markdown, '{"problem-17":[]}', difficultyText, problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/result\.json/i);
    expect(error.message).toMatch(/problem-17/);
    expect(error.message).toMatch(/submissions/i);
    expect(error.message).not.toMatch(/difficulty\.json/);
  });

  it("preserves difficulty.json problem details for a malformed record", async () => {
    writeUserSources(markdown, resultsText, '{"problem-23":42}', problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/difficulty\.json/i);
    expect(error.message).toMatch(/problem-23/);
    expect(error.message).toMatch(/string tier/i);
    expect(error.message).not.toMatch(/result\.json/);
  });

  it("preserves the user_info.md label without relabeling parser failures", async () => {
    const malformedMarkdown = markdown.replace("## 참여 대회 정보", "## 다른 정보");
    writeUserSources(malformedMarkdown, resultsText, difficultyText, problemsText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/user_info\.md/);
    expect(error.message).not.toMatch(/result\.json|difficulty\.json/);
  });

  it("loads exact source facts, supplied tiers, and availability totals", async () => {
    writeUserSources(markdown, resultsText, difficultyText, problemsText);

    const dashboard = await loadUserDashboard("jtw7913");

    expect(dashboard?.profile.solvedRank).toBe(9);
    expect(dashboard?.profile.firstPlaceCount).toBe(0);
    expect(dashboard?.problems.find(({ id }) => id === "65")?.tier.shortLabel).toBe("G1");
    expect(dashboard?.problems.find(({ id }) => id === "94")?.tier.shortLabel).toBe("UR");
    expect(dashboard?.problems.find(({ id }) => id === "298")?.tier.shortLabel).toBe("S2");
    expect(dashboard?.problems.find(({ id }) => id === "348")?.tier.shortLabel).toBe("P4");
    expect(
      dashboard?.difficultyDetails.find(({ key }) => key === "Gold I")?.totalAvailable,
    ).toBe(12);
    expect(
      dashboard?.difficultyGroups.find(({ key }) => key === "Gold")?.totalAvailable,
    ).toBe(69);
  });
});

async function captureLoadError(): Promise<Error> {
  try {
    await loadUserDashboard("jtw7913");
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error(`Expected an Error, received ${String(error)}`);
  }

  throw new Error("Expected loadUserDashboard to reject");
}

function expectWrappedJsonSyntaxError(error: Error): void {
  expect(error.cause).toBeInstanceOf(SyntaxError);

  if (!(error.cause instanceof SyntaxError)) {
    throw new Error("Expected the original JSON SyntaxError as the error cause");
  }

  expect(error.message).toContain(error.cause.message);
}

function writeUserSources(
  markdownSource: string,
  resultsSource: string,
  difficultySource: string,
  problemsSource: string,
): void {
  writeFileSync(join(fixtureRoot, "data", "user_info.md"), markdownSource, "utf8");
  writeFileSync(join(fixtureRoot, "data", "result.json"), resultsSource, "utf8");
  writeFileSync(join(fixtureRoot, "data", "difficulty.json"), difficultySource, "utf8");
  writeFileSync(join(fixtureRoot, "data", "problems.json"), problemsSource, "utf8");
}
