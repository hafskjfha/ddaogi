import { parseProblemTier, type ProblemTier } from "@/domain/problemTier";
import type {
  ContestSummary,
  LinkedRatedUser,
  ParticipationType,
} from "@/features/contest/model/types";

/** Problem metadata parsed directly from the contest information file. */
export interface ParsedContestProblem {
  readonly index: string;
  readonly title: string;
  readonly href: string;
  readonly tier: ProblemTier;
  readonly firstFull: (LinkedRatedUser & { readonly time: string }) | null;
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

const DOJ_HREF_PATTERNS = {
  contest: /^https:\/\/doj\.kr\/ko\/contests\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
  problem: /^https:\/\/doj\.kr\/ko\/problems\/\d+$/,
  user: /^https:\/\/doj\.kr\/ko\/user\/[A-Za-z0-9]+$/,
} as const;

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
  const href = parseHref(getListValue(lines, "링크"), "contest", 'field "링크"');
  const problemOrder = getListValue(lines, "문제순서");
  const ratedUpperBoundSource = getListValue(lines, "레이티드 참가자 범위");
  const ratedUpperBoundMatch = /^~(\d+)$/.exec(ratedUpperBoundSource);
  const director = parseLinkedRatedUser(getListValue(lines, "총괄"), 'field "총괄"');
  const setter = parseLinkedRatedUser(getListValue(lines, "출제"), 'field "출제"');
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
    href,
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
    const headingMatch = /^###\s+\[([A-Z]),\s*([^\]]*)\]\(([^()\s]+)\)$/.exec(heading);

    if (!headingMatch) {
      const problemIndex = /^###\s+(?:\[)?([A-Z])(?:,|\])/.exec(heading)?.[1];
      const context = problemIndex ? `problem ${problemIndex}` : `problem block ${blockIndex + 1}`;
      throw invalidContestInfo(`${context} has invalid linked heading "${heading}"`);
    }

    const index = headingMatch[1];
    const title = headingMatch[2].trim();
    const href = parseHref(headingMatch[3], "problem", `problem ${index}`);
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
      href,
      tier: parseTier(difficulty, index),
      firstFull: parseFirstFull(firstFull, index),
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
): ParsedContestProblem["firstFull"] {
  if (value === "-") {
    return null;
  }

  const match = /^\[([^,\]\r\n]+),\s*([^\]\r\n]+)\]\(([^()\s]+)\)\s+\((\d+m\s+\d+s)\)$/.exec(
    value,
  );
  if (!match) {
    throw invalidContestInfo(`problem ${problemIndex} has invalid FF Markdown "${value}"`);
  }

  return {
    ...parseLinkedRatedUserParts(match[1], match[2], match[3], `problem ${problemIndex} FF`),
    time: match[4],
  };
}

function parseLinkedRatedUser(value: string, context: string): LinkedRatedUser {
  const match = /^\[([^,\]\r\n]+),\s*([^\]\r\n]+)\]\(([^()\s]+)\)$/.exec(value);
  if (!match) {
    throw invalidContestInfo(`${context} has invalid linked user Markdown "${value}"`);
  }

  return parseLinkedRatedUserParts(match[1], match[2], match[3], context);
}

function parseLinkedRatedUserParts(
  handleSource: string,
  ratingSource: string,
  hrefSource: string,
  context: string,
): LinkedRatedUser {
  const handle = handleSource.trim();
  const ratingText = ratingSource.trim();
  if (handle.length === 0) {
    throw invalidContestInfo(`${context} has an empty handle`);
  }
  if (!/^\d+$/.test(ratingText)) {
    throw invalidContestInfo(`${context} has invalid rating "${ratingText}"`);
  }

  const rating = Number(ratingText);
  if (!Number.isSafeInteger(rating)) {
    throw invalidContestInfo(`${context} has invalid rating "${ratingText}"`);
  }

  return {
    handle,
    rating,
    href: parseHref(hrefSource, "user", context),
  };
}

function parseHref(
  value: string,
  kind: keyof typeof DOJ_HREF_PATTERNS,
  context: string,
): string {
  if (!DOJ_HREF_PATTERNS[kind].test(value)) {
    throw invalidContestInfo(`${context} has invalid ${kind} link "${value}"`);
  }
  return value;
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
