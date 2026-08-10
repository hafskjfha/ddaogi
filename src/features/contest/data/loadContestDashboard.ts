import "server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildContestDashboard } from "@/features/contest/data/buildContestDashboard";
import { parseContestInfo } from "@/features/contest/data/parseContestInfo";
import type { ContestDashboardData } from "@/features/contest/model/types";

const SUPPORTED_CONTEST_SLUG = "doj-beginner-contest-4";

/** Loads the supported mock contest and returns null for unknown slugs. */
export async function loadContestDashboard(
  slug: string,
): Promise<ContestDashboardData | null> {
  if (slug !== SUPPORTED_CONTEST_SLUG) return null;

  const [markdown, scoreboardText] = await Promise.all([
    readFile(resolve(process.cwd(), "data/contest_info.md"), "utf8"),
    readFile(resolve(process.cwd(), "data/contest_score_board.json"), "utf8"),
  ]);
  const scoreboardInput: unknown = JSON.parse(scoreboardText);

  return buildContestDashboard(parseContestInfo(markdown), scoreboardInput);
}
