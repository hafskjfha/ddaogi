import { describe, expect, it } from "vitest";
import { sources } from "../../../../data/dojstory/sources";
import { items } from "../../../../data/dojstory/items";
import { research } from "../../../../data/dojstory/research";
import { workshop } from "../../../../data/dojstory/workshop";
import { starforce, potential } from "../../../../data/dojstory/enhancements";
import { guides } from "../../../../data/dojstory/guides";
import { validateWikiDataset } from "./validateWikiDataset";

export const dataset = { sources, items, research, workshop, starforce, potential, guides };

describe("sourced DOJstory dataset", () => {
  it("preservesCollectedSourceFacts", () => {
    expect(items.filter((item) => item.kind === "equipment")).toHaveLength(16);
    expect(research).toHaveLength(12);
    expect(starforce.rows).toHaveLength(20);
    expect(potential.observedOptions).toHaveLength(15);
    expect(items.find((item) => item.slug === "basic-doll")?.aiGenerated.status).toBe("not-applicable");
    expect(research.find((entry) => entry.slug === "basic-processing")?.tokens).toMatchObject({ status: "sourced", value: 0 });
    expect(research.find((entry) => entry.slug === "basic-processing")?.durationSeconds).toMatchObject({ value: 0 });
    for (const slug of ["optical-separation-1", "chemical-engineering"]) {
      expect(research.find((entry) => entry.slug === slug)?.effects).toMatchObject({ status: "sourced", value: [] });
    }
    for (const slug of ["chemical-engineering", "optical-separation-2"]) {
      expect(research.find((entry) => entry.slug === slug)?.materials).toMatchObject({ value: [{ itemId: "basic-science-kit", quantity: 10 }] });
    }
    expect(sources.find((source) => source.id === "equipment")?.checkedAt.status).toBe("unknown");
    expect(sources.find((source) => source.id === "potential")?.checkedAt.status).toBe("unknown");
    expect(potential.observedOptions[3].amount.status).toBe("unknown");
    expect(items.find((item) => item.id === "copper-ore")?.name).toBe("구리");
    expect(items.find((item) => item.id === "iron-ore")?.name).toBe("철");
    expect(validateWikiDataset(dataset)).toEqual([]);
  });

  it("appliesUserClarificationsWithoutGuessingOtherFields", () => {
    const aurora = research.find((entry) => entry.slug === "aurora-synthesis")!;
    expect(aurora.access).toMatchObject({ value: { operator: "AND", powerOrEquipment: { operator: "OR", requiredDojpower: 200, equipmentId: "proof-of-worth" } } });
    expect(aurora.effects).toMatchObject({ value: [{ targetId: "aurora-prism", requiresSeparateRecipe: true }], refs: expect.arrayContaining([{ sourceId: "clarifications", section: "연구 효과와 소비 재료" }]) });
    expect(research.find((entry) => entry.slug === "basic-processing")?.name).toBe("기초 가공");
    expect(workshop.mineLevels[1].requiredXp).toMatchObject({ value: 900 });
    expect(workshop.mineLevels[2].requiredXp.status).toBe("unknown");
    expect(workshop.mineLevels[2].tokens.status).toBe("unknown");
    expect(guides.find((guide) => guide.slug === "dlc-dojpower")?.sections.flatMap((section) => section.blocks).some((block) => block.kind === "table" && block.rows.some((row) => row.some((cell) => cell.status === "unknown")))).toBe(true);
  });

  it("rejectsBrokenReferencesAndDuplicateIdentity", () => {
    const broken = structuredClone(dataset);
    broken.items.push(structuredClone(broken.items[0]));
    broken.research[0].refs.push({ sourceId: "missing", section: "test" });
    if (broken.research[1].prerequisites.status === "sourced") broken.research[1].prerequisites.value.push("missing-research");
    const errors = validateWikiDataset(broken).join(" ");
    expect(errors).toMatch(/duplicate.*id/i);
    expect(errors).toMatch(/duplicate.*slug/i);
    expect(errors).toMatch(/missing/);
  });
});
