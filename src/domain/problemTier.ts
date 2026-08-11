export type ProblemTierGroup =
  | "Unrated"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Ruby";

export interface ProblemTier {
  readonly group: ProblemTierGroup;
  readonly level: 1 | 2 | 3 | 4 | 5 | null;
  readonly label: string;
  readonly shortLabel: string;
  readonly color: string;
}

const TIER_COLORS: Record<ProblemTierGroup, string> = {
  Unrated: "#64748b",
  Bronze: "#ad5600",
  Silver: "#435f7a",
  Gold: "#ec9a00",
  Platinum: "#27e2a4",
  Diamond: "#00b4fc",
  Ruby: "#ff0062",
};

const TIER_SHORT_LABELS: Record<ProblemTierGroup, string> = {
  Unrated: "UR",
  Bronze: "B",
  Silver: "S",
  Gold: "G",
  Platinum: "P",
  Diamond: "D",
  Ruby: "R",
};

const ROMAN_LEVELS = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
} as const;

const UNRATED_TIER: ProblemTier = {
  group: "Unrated",
  level: null,
  label: "Unrated",
  shortLabel: "UR",
  color: TIER_COLORS.Unrated,
};

/** Converts a source tier such as "Silver V" into a normalized tier object. */
export function parseProblemTier(value?: string): ProblemTier {
  if (!value) {
    return UNRATED_TIER;
  }

  const match = /^(Bronze|Silver|Gold|Platinum|Diamond|Ruby) (I|II|III|IV|V)$/.exec(value.trim());

  if (!match) {
    return UNRATED_TIER;
  }

  const group = match[1] as ProblemTierGroup;
  const level = ROMAN_LEVELS[match[2] as keyof typeof ROMAN_LEVELS];

  return {
    group,
    level,
    label: `${group} ${match[2]}`,
    shortLabel: `${TIER_SHORT_LABELS[group]}${level}`,
    color: TIER_COLORS[group],
  };
}

/** Returns the compact display label for a normalized problem tier. */
export function formatProblemTier(tier: ProblemTier): string {
  return tier.shortLabel;
}
