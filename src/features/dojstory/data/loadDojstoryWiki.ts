import "server-only";
import { sources } from "../../../../data/dojstory/sources";
import { items } from "../../../../data/dojstory/items";
import { research } from "../../../../data/dojstory/research";
import { workshop } from "../../../../data/dojstory/workshop";
import { starforce, potential } from "../../../../data/dojstory/enhancements";
import { guides } from "../../../../data/dojstory/guides";
import type { WikiDataset } from "../model/types";
import { validateWikiDataset } from "./validateWikiDataset";

/** Refuses invalid data rather than silently presenting an empty catalog. */
export async function loadDojstoryWiki(): Promise<WikiDataset> {
  const data = { sources, items, research, workshop, starforce, potential, guides } satisfies WikiDataset;
  const errors = validateWikiDataset(data);
  if (errors.length) throw new Error(`DOJstory 자료 검증 실패: ${errors.join("; ")}`);
  return data;
}
