const KST_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Converts a timestamp to its calendar date in Korea Standard Time. */
export function toKstIsoDate(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid timestamp "${timestamp}"`);
  }

  const dateParts = new Map(
    KST_DATE_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return `${dateParts.get("year")}-${dateParts.get("month")}-${dateParts.get("day")}`;
}
