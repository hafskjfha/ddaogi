export type SourceRef = { sourceId: string; section: string };
export type Evidence<T> =
  | { status: "sourced" | "tentative"; value: T; refs: SourceRef[]; note?: string }
  | { status: "unknown" | "not-applicable"; reason: string; refs: SourceRef[] }
  | { status: "conflict"; claims: { text: string; refs: SourceRef[] }[] };
export const equipmentSlots = { background: "배경", doll: "인형", keyring: "키링", bag: "가방", laptop: "노트북", chair: "의자" } as const;
export type EquipmentSlot = keyof typeof equipmentSlots;
export type WikiQuery = { q: string; kind: "all" | "item" | "research" | "guide" | "workshop"; slot: string };
export type WikiSearchResult = { id: string; kind: Exclude<WikiQuery["kind"], "all">; title: string; href: string; summary: string };
export type RelatedLink = { id: string; title: string; href: string; label: string };
export type WikiSource = { id: string; title: string; checkedAt: Evidence<string>; externalUrls: string[] };
export type SourceDocument = WikiSource & { text: string };
export type WikiEntity = { id: string; slug: string; name: string; aliases: string[]; refs: SourceRef[]; checkedAt: Evidence<string> };
export type WikiItem = WikiEntity & {
  kind: "equipment" | "minimal";
  slot: Evidence<EquipmentSlot>;
  options: Evidence<string[]>;
  auctionable: Evidence<boolean>;
  aiGenerated: Evidence<boolean>;
  requiredDojpower: Evidence<number>;
  starforce: Evidence<string>;
  image: Evidence<string>;
  acquisition: Evidence<string>;
};
export type WikiResearch = WikiEntity & {
  prerequisites: Evidence<string[]>;
  access: Evidence<{ operator: "AND"; powerOrEquipment: { operator: "OR"; requiredDojpower: number; equipmentId: string } }>;
  tokens: Evidence<number>;
  materials: Evidence<{ itemId: string; quantity: number }[]>;
  durationSeconds: Evidence<number>;
  effects: Evidence<{ text: string; targetId?: string; requiresSeparateRecipe?: boolean }[]>;
};
export type Mine = WikiEntity & {
  capacity: Evidence<number>;
  perProblem: Evidence<string>;
  consecutive: Evidence<string>;
  secondsPerOre: Evidence<number>;
  xpPerOre: Evidence<number>;
  outputItemId: string;
  prerequisiteId: string;
};
export type Workshop = {
  refs: SourceRef[];
  itemUses: Evidence<{ itemId: string; section: "machines" | "power" | "mines"; description: string }[]>;
  machineLevels: { level: number; timeReduction: Evidence<number>; tokens: Evidence<number> }[];
  machineCount: Evidence<number>;
  machineExpansion: Evidence<string>;
  moduleSlots: Evidence<string>;
  powerGrowth: Evidence<string>;
  durabilityMax: Evidence<number>;
  durabilityPerItem: Evidence<number>;
  repairRecovery: Evidence<number>;
  exhaustedTimeMultiplier: Evidence<number>;
  basePowerKw: Evidence<number>;
  solarPowerKw: Evidence<number>;
  shortageMultiplier: Evidence<number>;
  personalModifiers: Evidence<string>;
  streakRule: Evidence<string>;
  mines: Mine[];
  mineLevels: { level: number; tokens: Evidence<number>; ironIngots: Evidence<number>; requiredXp: Evidence<number> }[];
  mineRules: Evidence<string[]>;
};
export type Starforce = {
  refs: SourceRef[];
  maxBackground: Evidence<number>;
  maxOther: Evidence<number>;
  rows: { from: number; tokens: Evidence<number>; successPercent: Evidence<number>; dropOnFailurePercent: Evidence<number> }[];
};
export type Potential = {
  refs: SourceRef[];
  grades: { name: string; upgradePercent: Evidence<number>; poolSize: Evidence<number> }[];
  lines: { line: number; currentPercent: Evidence<number>; lowerPercent: Evidence<number> }[];
  observedOptions: { text: string; amount: Evidence<number> }[];
};
export type GuideCell = Evidence<string | number>;
export type GuideBlock =
  | { kind: "paragraph"; content: Evidence<string> }
  | { kind: "list"; content: Evidence<string[]> }
  | { kind: "table"; caption: string; headers: string[]; rows: GuideCell[][] };
export type GuideDocument = { id: string; slug: string; title: string; summary: string; refs: SourceRef[]; checkedAt: Evidence<string>; relatedIds: string[]; sections: { title: string; blocks: GuideBlock[] }[] };
export type WikiDataset = { sources: WikiSource[]; items: WikiItem[]; research: WikiResearch[]; workshop: Workshop; starforce: Starforce; potential: Potential; guides: GuideDocument[] };
