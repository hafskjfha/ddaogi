import { parseProblemTier, type ProblemTier } from "@/domain/problemTier";
import type { ContestSummary, ParticipationType } from "@/features/contest/model/types";

/** Problem metadata parsed directly from the contest information file. */
export interface ParsedContestProblem {
  readonly index: string;
  readonly title: string;
  readonly tier: ProblemTier;
  readonly firstFullHandle: string | null;
  readonly firstFullTime: string | null;
}

/** Contest metadata and problems parsed from the stable mock schema. */
export interface ParsedContestInfo {
  readonly contest: ContestSummary;
  readonly problems: readonly ParsedContestProblem[];
}

const TIER_GROUPS = {
  B: "Bronze",
  S: "Silver",
  G: "Gold",
  P: "Platinum",
  D: "Diamond",
  R: "Ruby",
} as const;

const TIER_LEVELS = {
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IV",
  "5": "V",
} as const;

const EXPECTED_PROBLEM_INDICES = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

/** Parses DOJ Beginner Contest 4's stable mock Markdown schema. */
export function parseContestInfo(markdown: string): ParsedContestInfo {
  const lines = markdown.split(/\r?\n/);
  const contest = parseContestSummary(lines);
  const problems = parseProblems(lines);

  if (
    problems.length !== EXPECTED_PROBLEM_INDICES.length ||
    problems.some((problem, index) => problem.index !== EXPECTED_PROBLEM_INDICES[index])
  ) {
    throw invalidContestInfo(
      `expected problem indices ${EXPECTED_PROBLEM_INDICES.join(", ")} in order; found ${problems
        .map((problem) => problem.index)
        .join(", ")}`,
    );
  }

  return { contest, problems };
}

function parseContestSummary(lines: readonly string[]): ContestSummary {
  const heading = lines.find((line) => /^#\s+/.test(line.trim()));
  const titleMatch = heading ? /^#\s+(.+?)\s+대회 정보$/.exec(heading.trim()) : null;

  if (!titleMatch) {
    throw invalidContestInfo("contest title is missing");
  }

  const title = titleMatch[1].trim();
  const problemOrder = getListValue(lines, "문제순서");
  const ratedUpperBoundSource = getListValue(lines, "레이티드 참가자 범위");
  const ratedUpperBoundMatch = /^~(\d+)$/.exec(ratedUpperBoundSource);
  const director = getListValue(lines, "총괄");
  const setter = getListValue(lines, "출제");
  const startLabel = getListValue(lines, "대회 시작시간");
  const endLabel = getListValue(lines, "대회 종료시간");
  const participationType = parseParticipationType(getListValue(lines, "대회 참가 타입"));
  const durationSource = getListValue(lines, "대회 제한 시간");
  const durationMatch = /^(\d+)분$/.exec(durationSource);

  if (!ratedUpperBoundMatch) {
    throw invalidContestInfo(`invalid rated participant range "${ratedUpperBoundSource}"`);
  }
  if (!durationMatch || Number(durationMatch[1]) <= 0) {
    throw invalidContestInfo(`invalid contest duration "${durationSource}"`);
  }

  return {
    slug: slugify(title),
    title,
    problemOrder,
    ratedUpperBound: Number(ratedUpperBoundMatch[1]),
    director,
    setter,
    startAt: parseKoreanDateTime(startLabel),
    endAt: parseKoreanDateTime(endLabel),
    startLabel,
    endLabel,
    participationType,
    durationMinutes: Number(durationMatch[1]),
  };
}

function parseProblems(lines: readonly string[]): readonly ParsedContestProblem[] {
  const problemHeadingIndices = lines.flatMap((line, index) =>
    line.trim().startsWith("### ") ? [index] : [],
  );
  const seenIndices = new Set<string>();

  return problemHeadingIndices.map((headingIndex, blockIndex) => {
    const heading = lines[headingIndex].trim();
    const headingMatch = /^###\s+([A-Z]),\s*(.*)$/.exec(heading);

    if (!headingMatch) {
      throw invalidContestInfo(`invalid problem heading "${heading}"`);
    }

    const index = headingMatch[1];
    const title = headingMatch[2].trim();
    if (title.length === 0) {
      throw invalidContestInfo(`problem ${index} is missing its title`);
    }
    if (seenIndices.has(index)) {
      throw invalidContestInfo(`duplicate problem index "${index}"`);
    }
    seenIndices.add(index);

    const nextHeadingIndex = problemHeadingIndices[blockIndex + 1] ?? lines.length;
    const blockLines = lines.slice(headingIndex + 1, nextHeadingIndex);
    const difficulty = getProblemValue(blockLines, "난이도", index);
    const firstFull = getFirstFullValue(blockLines, index);

    return {
      index,
      title,
      tier: parseTier(difficulty, index),
      ...parseFirstFull(firstFull, index),
    };
  });
}

function getListValue(lines: readonly string[], label: string): string {
  const prefix = `- ${label}:`;
  const line = lines.find((candidate) => candidate.trimStart().startsWith(prefix));
  const value = line?.trimStart().slice(prefix.length).trim();

  if (!value) {
    throw invalidContestInfo(`required field "${label}" is missing`);
  }

  return value;
}

function getProblemValue(lines: readonly string[], label: string, problemIndex: string): string {
  const prefix = `- ${label}:`;
  const line = lines.find((candidate) => candidate.trim().startsWith(prefix));
  const value = line?.trim().slice(prefix.length).trim();

  if (!value) {
    throw invalidContestInfo(`problem ${problemIndex} is missing ${label}`);
  }

  return value;
}

function getFirstFullValue(lines: readonly string[], problemIndex: string): string {
  const line = lines.find((candidate) => /^- (?:최초 만점\(FF\)|FF):/.test(candidate.trim()));
  const value = line?.trim().replace(/^- (?:최초 만점\(FF\)|FF):\s*/, "").trim();

  if (!value) {
    throw invalidContestInfo(`problem ${problemIndex} is missing FF`);
  }

  return value;
}

function parseTier(value: string, problemIndex: string): ProblemTier {
  if (value === "U") {
    return parseProblemTier();
  }

  const match = /^(B|S|G|P|D|R)([1-5])$/.exec(value);
  if (!match) {
    throw invalidContestInfo(`problem ${problemIndex} has invalid difficulty "${value}"`);
  }

  const group = TIER_GROUPS[match[1] as keyof typeof TIER_GROUPS];
  const level = TIER_LEVELS[match[2] as keyof typeof TIER_LEVELS];
  return parseProblemTier(`${group} ${level}`);
}

function parseFirstFull(
  value: string,
  problemIndex: string,
): Pick<ParsedContestProblem, "firstFullHandle" | "firstFullTime"> {
  if (value === "-") {
    return { firstFullHandle: null, firstFullTime: null };
  }

  const match = /^(\S+)\s+\((\d+m\s+\d+s)\)$/.exec(value);
  if (!match) {
    throw invalidContestInfo(`problem ${problemIndex} has invalid FF "${value}"`);
  }

  return { firstFullHandle: match[1], firstFullTime: match[2] };
}

function parseParticipationType(value: string): ParticipationType {
  if (value === "일반") return "regular";
  if (value === "window") return "window";
  throw invalidContestInfo(`invalid participation type "${value}"`);
}

function parseKoreanDateTime(value: string): string {
  const match = /^(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일\s+(오전|오후)\s+(\d{1,2}):(\d{2})$/.exec(
    value,
  );

  if (!match) {
    throw invalidContestInfo(`invalid contest date-time "${value}"`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const sourceHour = Number(match[5]);
  const minute = Number(match[6]);
  if (sourceHour < 1 || sourceHour > 12 || minute > 59) {
    throw invalidContestInfo(`invalid contest date-time "${value}"`);
  }

  const hour = (sourceHour % 12) + (match[4] === "오후" ? 12 : 0);
  const validationDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    validationDate.getUTCFullYear() !== year ||
    validationDate.getUTCMonth() !== month - 1 ||
    validationDate.getUTCDate() !== day ||
    validationDate.getUTCHours() !== hour ||
    validationDate.getUTCMinutes() !== minute
  ) {
    throw invalidContestInfo(`invalid contest date-time "${value}"`);
  }

  const pad = (number: number): string => number.toString().padStart(2, "0");
  return `${year.toString().padStart(4, "0")}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+09:00`;
}

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw invalidContestInfo("contest title cannot form a slug");
  }
  return slug;
}

function invalidContestInfo(message: string): Error {
  return new Error(`Invalid contest_info.md: ${message}`);
}
