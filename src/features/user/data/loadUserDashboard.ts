import "server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildUserDashboard } from "./buildUserDashboard";
import { parseUserInfo } from "./parseUserInfo";
import type { UserDashboardData } from "@/features/user/model/types";

/** Loads the only supported mock user and returns null for unknown handles. */
export async function loadUserDashboard(handle: string): Promise<UserDashboardData | null> {
  if (handle !== "jtw7913") return null;

  const [markdown, resultsText, difficultyText, problemsText] = await Promise.all([
    readFile(resolve(process.cwd(), "data/user_info.md"), "utf8"),
    readFile(resolve(process.cwd(), "data/result.json"), "utf8"),
    readFile(resolve(process.cwd(), "data/difficulty.json"), "utf8"),
    readFile(resolve(process.cwd(), "data/problems.json"), "utf8"),
  ]);

  const resultsInput = parseJsonSource(resultsText, "result.json");
  const difficultiesInput = parseJsonSource(difficultyText, "difficulty.json");
  const problemTotalsInput = parseJsonSource(problemsText, "problems.json");

  return buildUserDashboard(
    handle,
    parseUserInfo(markdown),
    resultsInput,
    difficultiesInput,
    problemTotalsInput,
  );
}

function parseJsonSource(
  source: string,
  filename: "result.json" | "difficulty.json" | "problems.json",
): unknown {
  try {
    const input: unknown = JSON.parse(source);
    return input;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new SyntaxError(`Invalid ${filename}: ${message}`, { cause: error });
  }
}
