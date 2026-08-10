import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/contest/data/serverOnly", () => ({}));

import { loadContestDashboard } from "@/features/contest/data/loadContestDashboard";

describe("loadContestDashboard", () => {
  it("returns null for an unsupported slug", async () => {
    await expect(loadContestDashboard("unknown")).resolves.toBeNull();
  });

  it("loads and validates the supported contest source files", async () => {
    const dashboard = await loadContestDashboard("doj-beginner-contest-4");

    expect(dashboard).toMatchObject({
      contest: { slug: "doj-beginner-contest-4" },
      ratedParticipantCount: 39,
    });
    expect(dashboard?.problems).toHaveLength(9);
  });
});
