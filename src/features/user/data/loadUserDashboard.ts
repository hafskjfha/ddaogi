import "server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildUserDashboard } from "./buildUserDashboard";
import { parseUserInfo } from "./parseUserInfo";
import type { UserDashboardData } from "@/features/user/model/types";

/** Loads the only supported mock user and returns null for unknown handles. */
export async function loadUserDashboard(handle: string): Promise<UserDashboardData | null> {
  if (handle !== "jtw7913") return null;

  const [markdown, resultsText, difficultyText] = await Promise.all([
    readFile(resolve(process.cwd(), "data/user_info.md"), "utf8"),
    readFile(resolve(process.cwd(), "data/result.json"), "utf8"),
    readFile(resolve(process.cwd(), "data/difficulty.json"), "utf8"),
  ]);

  const resultsInput: unknown = JSON.parse(resultsText);
  const difficultiesInput: unknown = JSON.parse(difficultyText);

  return buildUserDashboard(
    handle,
    parseUserInfo(markdown),
    resultsInput,
    difficultiesInput,
  );
}
