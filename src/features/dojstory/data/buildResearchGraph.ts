import type { WikiResearch } from "../model/types";

export type ResearchGraphNode = {
  id: string;
  slug: string;
  name: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  prerequisiteCount: number | null;
  tentative: boolean;
};
export type ResearchGraphEdge = { from: string; to: string; path: string; skipsLayer: boolean; tentative: boolean };
export type ResearchGraphLayout = { nodes: ResearchGraphNode[]; edges: ResearchGraphEdge[]; width: number; height: number };

const NODE_WIDTH = 224;
const NODE_HEIGHT = 76;
const COLUMN_GAP = 128;
const ROW_GAP = 36;
const PADDING = 32;

/** Builds a deterministic, longest-path DAG layout from explicit prerequisites only. */
export function buildResearchGraph(research: WikiResearch[]): ResearchGraphLayout {
  const entries = [...research].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const parents = (entry: WikiResearch) => "value" in entry.prerequisites ? entry.prerequisites.value : [];
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  function depth(id: string): number {
    const saved = depths.get(id);
    if (saved !== undefined) return saved;
    if (visiting.has(id)) throw new Error("연구 선행 관계에 순환이 있습니다.");
    const entry = byId.get(id);
    if (!entry) throw new Error("연구 선행 참조를 찾을 수 없습니다.");
    visiting.add(id);
    const result = Math.max(-1, ...parents(entry).map(depth)) + 1;
    visiting.delete(id);
    depths.set(id, result);
    return result;
  }
  entries.forEach((entry) => depth(entry.id));

  const layers: WikiResearch[][] = [];
  for (const entry of entries) (layers[depth(entry.id)] ??= []).push(entry);
  const order = new Map<string, number>();
  // Parent barycentres keep related branches together without changing the data.
  for (const layer of layers) {
    const score = (entry: WikiResearch) => {
      const ids = parents(entry);
      return ids.length ? ids.reduce((sum, id) => sum + order.get(id)!, 0) / ids.length : 0;
    };
    layer.sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name, "ko"));
    layer.forEach((entry, index) => order.set(entry.id, (index + 0.5) / layer.length));
  }

  const edgePairs = entries.flatMap((entry) => [...parents(entry)].sort().map((from) => ({ from, to: entry.id, tentative: entry.prerequisites.status === "tentative" })));
  const skipCount = edgePairs.filter((edge) => depth(edge.to) - depth(edge.from) > 1).length;
  const top = PADDING + skipCount * 18;
  const rows = Math.max(1, ...layers.map((layer) => layer.length));
  const width = PADDING * 2 + Math.max(1, layers.length) * NODE_WIDTH + Math.max(0, layers.length - 1) * COLUMN_GAP;
  const height = top + PADDING + rows * NODE_HEIGHT + (rows - 1) * ROW_GAP;
  const nodes = layers.flatMap((layer, level) => layer.map((entry, index): ResearchGraphNode => ({
    id: entry.id, slug: entry.slug, name: entry.name, depth: level,
    x: PADDING + level * (NODE_WIDTH + COLUMN_GAP),
    y: top + ((rows - layer.length) / 2 + index) * (NODE_HEIGHT + ROW_GAP),
    width: NODE_WIDTH, height: NODE_HEIGHT,
    prerequisiteCount: "value" in entry.prerequisites ? entry.prerequisites.value.length : null,
    tentative: entry.prerequisites.status === "tentative",
  })));
  const positioned = new Map(nodes.map((node) => [node.id, node]));
  let skipLane = 0;
  const edges = edgePairs.map((edge): ResearchGraphEdge => {
    const from = positioned.get(edge.from)!;
    const to = positioned.get(edge.to)!;
    const sx = from.x + from.width;
    const sy = from.y + from.height / 2;
    const tx = to.x - 6;
    const ty = to.y + to.height / 2;
    const skipsLayer = to.depth - from.depth > 1;
    // Long edges run above the intermediate column instead of through its nodes.
    const lane = PADDING / 2 + skipLane * 18;
    const bend = COLUMN_GAP * (0.25 + 0.5 * (skipLane + 1) / (skipCount + 1));
    const path = skipsLayer
      ? `M ${sx} ${sy} H ${sx + bend} V ${lane} H ${tx - bend} V ${ty} H ${tx}`
      : `M ${sx} ${sy} C ${sx + COLUMN_GAP / 2} ${sy}, ${tx - COLUMN_GAP / 2} ${ty}, ${tx} ${ty}`;
    if (skipsLayer) skipLane++;
    return { ...edge, skipsLayer, path };
  });
  return { nodes, edges, width, height };
}
