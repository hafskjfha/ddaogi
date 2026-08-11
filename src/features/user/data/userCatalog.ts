export interface SupportedUserSummary {
  readonly handle: string;
  readonly href: string;
  readonly title: string;
  readonly currentRating: number;
  readonly solvedCount: number;
}

/** The only user currently backed by the repository's mock snapshot. */
export const SUPPORTED_USER: SupportedUserSummary = {
  handle: "jtw7913",
  href: "/users/jtw7913",
  title: "SPECIALIST",
  currentRating: 1429,
  solvedCount: 90,
};
