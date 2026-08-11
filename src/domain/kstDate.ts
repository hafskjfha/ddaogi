const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const UTC_ISO_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

/** Converts a timestamp to its calendar date in Korea Standard Time. */
export function toKstIsoDate(timestamp: string): string {
  const date = parseStrictUtcIsoTimestamp(timestamp);

  if (!date) {
    throw new TypeError(`Invalid timestamp "${timestamp}"`);
  }

  const dateParts = new Map(
    KST_DATE_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return `${dateParts.get("year")}-${dateParts.get("month")}-${dateParts.get("day")}`;
}

/** Returns whether a value is a real UTC ISO timestamp without calendar normalization. */
export function isValidUtcIsoTimestamp(timestamp: string): boolean {
  return parseStrictUtcIsoTimestamp(timestamp) !== null;
}

function parseStrictUtcIsoTimestamp(timestamp: string): Date | null {
  const match = UTC_ISO_TIMESTAMP.exec(timestamp);

  if (!match) return null;

  const date = new Date(timestamp);
  const milliseconds = Number((match[7] ?? "").padEnd(3, "0"));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3]) ||
    date.getUTCHours() !== Number(match[4]) ||
    date.getUTCMinutes() !== Number(match[5]) ||
    date.getUTCSeconds() !== Number(match[6]) ||
    date.getUTCMilliseconds() !== milliseconds
  ) {
    return null;
  }

  return date;
}
