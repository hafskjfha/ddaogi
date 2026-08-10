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
    writeUserSources(markdown, "{", difficultyText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/result\.json/);
    expect(error.message).not.toMatch(/difficulty\.json/);
    expectWrappedJsonSyntaxError(error);
  });

  it("names only difficulty.json when its JSON syntax is invalid", async () => {
    writeUserSources(markdown, resultsText, "{");

    const error = await captureLoadError();

    expect(error.message).toMatch(/difficulty\.json/);
    expect(error.message).not.toMatch(/result\.json/);
    expectWrappedJsonSyntaxError(error);
  });

  it("names only result.json when its structure is invalid", async () => {
    writeUserSources(markdown, "[]", difficultyText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/result\.json/);
    expect(error.message).not.toMatch(/difficulty\.json/);
  });

  it("names only difficulty.json when its structure is invalid", async () => {
    writeUserSources(markdown, resultsText, "[]");

    const error = await captureLoadError();

    expect(error.message).toMatch(/difficulty\.json/);
    expect(error.message).not.toMatch(/result\.json/);
  });

  it("preserves the user_info.md label without relabeling parser failures", async () => {
    const malformedMarkdown = markdown.replace("## 참여 대회 정보", "## 다른 정보");
    writeUserSources(malformedMarkdown, resultsText, difficultyText);

    const error = await captureLoadError();

    expect(error.message).toMatch(/user_info\.md/);
    expect(error.message).not.toMatch(/result\.json|difficulty\.json/);
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
): void {
  writeFileSync(join(fixtureRoot, "data", "user_info.md"), markdownSource, "utf8");
  writeFileSync(join(fixtureRoot, "data", "result.json"), resultsSource, "utf8");
  writeFileSync(join(fixtureRoot, "data", "difficulty.json"), difficultySource, "utf8");
}
