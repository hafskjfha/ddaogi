import { expect, it } from "vitest";
import { research } from "../../../../data/dojstory/research";
import { buildResearchGraph } from "./buildResearchGraph";

it("laysOutEveryCollectedResearchAndEveryMandatoryEdge", () => {
  const original = JSON.stringify(research);
  const graph = buildResearchGraph(research);
  expect(graph.nodes).toHaveLength(12);
  expect(graph.edges).toHaveLength(14);
  expect(graph.edges.filter((edge) => edge.to === "aurora-synthesis").map((edge) => edge.from).sort()).toEqual(["crystal-compression", "optical-separation-1"]);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const edge of graph.edges) {
    expect(nodes.get(edge.from)!.depth).toBeLessThan(nodes.get(edge.to)!.depth);
    expect(edge.path).toMatch(/^M/);
  }
  expect(nodes.get("basic-processing")?.depth).toBe(0);
  expect(nodes.get("aurora-synthesis")?.depth).toBe(2);
  expect(nodes.get("metal-processing")?.depth).toBe(2);
  expect(graph.edges.find((edge) => edge.from === "basic-processing" && edge.to === "metal-processing")?.skipsLayer).toBe(true);
  for (const node of graph.nodes) {
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.y + node.height).toBeLessThanOrEqual(graph.height);
  }
  expect(JSON.stringify(research)).toBe(original);
  expect(buildResearchGraph([...research].reverse())).toEqual(graph);
});

it("keepsUnknownPrerequisitesDistinctFromConfirmedRoots", () => {
  const entries = structuredClone(research.slice(0, 1));
  entries[0].prerequisites = { status: "unknown", reason: "not collected", refs: entries[0].refs };
  expect(buildResearchGraph(entries).nodes[0].prerequisiteCount).toBeNull();
  expect(buildResearchGraph([])).toMatchObject({ nodes: [], edges: [] });
});

it("routesLongEdgesInSeparateVerticalLanes", () => {
  const longEdges = buildResearchGraph(research).edges.filter((edge) => edge.skipsLayer);
  const firstVerticalX = longEdges.map((edge) => edge.path.match(/H ([\d.]+) V/)?.[1]);
  expect(new Set(firstVerticalX).size).toBe(longEdges.length);
});

it("rejectsCyclesAndMissingPrerequisitesInsteadOfHanging", () => {
  const entries = structuredClone(research);
  entries[0].prerequisites = { status: "sourced", value: ["crystal-compression"], refs: entries[0].refs };
  expect(() => buildResearchGraph(entries)).toThrow(/순환/);
  entries[0].prerequisites = { status: "sourced", value: ["uncollected"], refs: entries[0].refs };
  expect(() => buildResearchGraph(entries)).toThrow(/참조/);
});
