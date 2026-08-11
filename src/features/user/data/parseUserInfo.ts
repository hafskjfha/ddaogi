import type {
  ContestCalendarEntry,
  ContestParticipation,
  UserProfile,
} from "@/features/user/model/types";

export type ParsedParticipation = Omit<
  ContestParticipation,
  "ratingAfter" | "tierBefore" | "tierAfter"
>;

export interface ParsedUserInfo {
  readonly profile: Omit<
    UserProfile,
    "handle" | "title" | "titleColor" | "solvedCount" | "solvedRank" | "firstPlaceCount"
  > & {
    readonly solvedRank: number;
    readonly firstPlaceCount: number;
  };
  readonly initialRating: number;
  readonly participations: readonly ParsedParticipation[];
  readonly contestCalendar: readonly ContestCalendarEntry[];
}

const PARTICIPATION_HEADING = "## 참여 대회 정보";
const CALENDAR_HEADING = "# 전체 대회 정보";
const INTRODUCTION_HEADING = "## 소개";
const PARTICIPATION_HEADER = ["날짜", "대회명", "랭킹", "퍼포먼스레이팅", "diff", "기타"];
const CALENDAR_HEADER = ["시작 시간", "대회 이름"];

/** Parses the stable mock Markdown schema into typed user records. */
export function parseUserInfo(markdown: string): ParsedUserInfo {
  const lines = markdown.split(/\r?\n/);
  const ratingLines = getSection(lines, "## 레이팅 정보");
  const introductionLines = getSection(lines, INTRODUCTION_HEADING);
  const participationLines = getSection(lines, PARTICIPATION_HEADING);
  const otherInfoLines = getSection(lines, "## 대회 기타 정보");
  const calendarLines = getSection(lines, CALENDAR_HEADING);
  const profile = parseProfile(ratingLines, introductionLines, otherInfoLines);
  const participationRows = getTableRows(participationLines, PARTICIPATION_HEADER, PARTICIPATION_HEADING);
  const initialRow = participationRows.find((row) => row[5] === "초기 레이팅");

  if (!initialRow) {
    throw invalidUserInfo("initial rating row is missing");
  }

  const initialRating = parseSignedNumber(initialRow[4], "initial rating");
  const participations = participationRows
    .filter((row) => row !== initialRow)
    .map(parseParticipation);
  const participatedContests = new Set(
    participations.map((participation) => contestKey(participation.date, participation.name)),
  );
  const contestCalendar = getTableRows(calendarLines, CALENDAR_HEADER, CALENDAR_HEADING).map(
    ([dateToken, name], index) => {
      const date = parseKoreanDate(dateToken);

      return {
        index: index + 1,
        date,
        name,
        participated: participatedContests.has(contestKey(date, name)),
      };
    },
  );

  return { profile, initialRating, participations, contestCalendar };
}

function parseProfile(
  ratingLines: readonly string[],
  introductionLines: readonly string[],
  otherInfoLines: readonly string[],
): ParsedUserInfo["profile"] {
  const ratingText = ratingLines.join("\n");
  const ratingMatch = /현재:\s*(\d+)\((\d+)등,\s*top([\d.]+)%\),\s*max:\s*(\d+)/.exec(ratingText);
  const otherInfoText = otherInfoLines.join("\n");
  const podiumMatch = /1,2,3등:\s*(\d+)번/.exec(otherInfoText);
  const firstPlaceMatch = /대회 1등:\s*(\d+)번/.exec(otherInfoText);
  const firstFullMatch = /최초 만점:\s*(\d+)번/.exec(otherInfoText);
  const solvedRankMatch = /만점 문제 랭킹:\s*(\d+)등/.exec(otherInfoText);

  if (!ratingMatch || !podiumMatch || !firstFullMatch) {
    throw invalidUserInfo("profile fields do not match the expected schema");
  }

  if (!firstPlaceMatch) {
    throw invalidUserInfo("explicit first-place count is missing or invalid");
  }

  if (!solvedRankMatch) {
    throw invalidUserInfo("explicit solved rank is missing or invalid");
  }

  return {
    introduction: parseIntroduction(introductionLines),
    currentRating: Number(ratingMatch[1]),
    maxRating: Number(ratingMatch[4]),
    ratingRank: Number(ratingMatch[2]),
    ratingPercentile: Number(ratingMatch[3]),
    solvedRank: Number(solvedRankMatch[1]),
    podiumCount: Number(podiumMatch[1]),
    firstPlaceCount: Number(firstPlaceMatch[1]),
    firstFullCount: Number(firstFullMatch[1]),
  };
}

function parseIntroduction(lines: readonly string[]): string {
  const introduction = lines.join("\n").trim();
  const characterCount = [...introduction].length;
  const lineBreakCount = introduction.length === 0 ? 0 : introduction.split("\n").length - 1;

  if (characterCount > 500) {
    throw invalidUserInfo("introduction must contain at most 500 characters");
  }

  if (lineBreakCount > 6) {
    throw invalidUserInfo("introduction must contain at most 6 line breaks");
  }

  return introduction;
}

function parseParticipation(row: readonly string[]): ParsedParticipation {
  const ratingDiff = row[4] === "-" ? null : parseSignedNumber(row[4], "rating diff");

  return {
    date: parseDottedDate(row[0]),
    name: row[1],
    rank: parseUnsignedNumber(row[2], "contest rank"),
    performanceRating:
      row[3] === "-" ? null : parseUnsignedNumber(row[3], "performance rating"),
    ratingDiff,
    rated: ratingDiff !== null,
  };
}

function getSection(lines: readonly string[], heading: string): readonly string[] {
  const startIndex = lines.findIndex((line) => line.trim() === heading);

  if (startIndex === -1) {
    throw invalidUserInfo(`expected section "${heading}" is missing`);
  }

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^#{1,2}\s/.test(line.trim()),
  );

  return lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex);
}

function getTableRows(
  sectionLines: readonly string[],
  expectedHeader: readonly string[],
  sectionHeading: string,
): readonly string[][] {
  const tableRows = sectionLines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map(splitTableRow);
  const headerIndex = tableRows.findIndex((row) => rowsEqual(row, expectedHeader));

  if (headerIndex === -1) {
    throw invalidUserInfo(`expected table header in "${sectionHeading}" is missing`);
  }

  const dataRows = tableRows.slice(headerIndex + 1).filter((row) => !isSeparatorRow(row));

  if (dataRows.some((row) => row.length !== expectedHeader.length)) {
    throw invalidUserInfo(`table in "${sectionHeading}" has an unexpected number of columns`);
  }

  return dataRows;
}

function splitTableRow(line: string): string[] {
  return line.slice(1, -1).split("|").map((cell) => cell.trim());
}

function rowsEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isSeparatorRow(row: readonly string[]): boolean {
  return row.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseDottedDate(value: string): string {
  const match = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(value);

  if (!match) {
    throw invalidUserInfo(`invalid contest date "${value}"`);
  }

  return formatIsoDate(Number(match[1]), Number(match[2]), Number(match[3]), value);
}

function parseKoreanDate(value: string): string {
  const match = /^(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일(?:\s|$)/.exec(value);

  if (!match) {
    throw invalidUserInfo(`invalid calendar date "${value}"`);
  }

  return formatIsoDate(Number(match[1]), Number(match[2]), Number(match[3]), value);
}

function formatIsoDate(year: number, month: number, day: number, source: string): string {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw invalidUserInfo(`invalid calendar date "${source}"`);
  }

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function parseSignedNumber(value: string, field: string): number {
  if (!/^[+-]?\d+$/.test(value)) {
    throw invalidUserInfo(`invalid ${field} "${value}"`);
  }

  return Number(value);
}

function contestKey(date: string, name: string): string {
  return `${date}\u0000${name}`;
}

function parseUnsignedNumber(value: string, field: string): number {
  if (!/^\d+$/.test(value)) {
    throw invalidUserInfo(`invalid ${field} "${value}"`);
  }

  return Number(value);
}

function invalidUserInfo(message: string): Error {
  return new Error(`Invalid user_info.md: ${message}`);
}
