import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sources } from "../../../../data/dojstory/sources";
import type { SourceDocument } from "../model/types";

const sourceFiles = {
  equipment: "equipment.md", research: "process_research.md", workshop: "workshop.md",
  starforce: "starforce.md", potential: "potential.md", dlc: "dlc_dojpower.md", clarifications: "clarifications.md",
} as const;

/** Reads only the seven registered local originals, preserving their exact text. */
export async function loadWikiSource(sourceId: string): Promise<SourceDocument | null> {
  if (!Object.hasOwn(sourceFiles, sourceId)) return null;
  const source = sources.find((entry) => entry.id === sourceId)!;
  const text = await readFile(resolve(process.cwd(), "docs/dojstory-data", sourceFiles[sourceId as keyof typeof sourceFiles]), "utf8");
  return { ...source, text };
}
