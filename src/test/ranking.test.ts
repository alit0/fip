import { describe, it, expect } from "vitest";
import { getRanking } from "@/lib/content/ranking";

describe("getRanking", () => {
  it("returns a RankingCountry for a known country slug", async () => {
    const result = await getRanking("colombia");
    expect(result).not.toBeNull();
    expect(result!.label).toBe("Colombia");
  });

  it("returns null for an unknown country slug", async () => {
    const result = await getRanking("pais-inexistente");
    expect(result).toBeNull();
  });

  it("the returned object has label, countryCode and rows", async () => {
    const result = await getRanking("argentina");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("countryCode");
    expect(result).toHaveProperty("rows");
    expect(Array.isArray(result!.rows)).toBe(true);
  });

  it("rows contain agency and position fields", async () => {
    const result = await getRanking("colombia");
    expect(result!.rows.length).toBeGreaterThan(0);
    for (const row of result!.rows) {
      expect(row).toHaveProperty("position");
      expect(row).toHaveProperty("agency");
    }
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getRanking("colombia", "es");
    const pt = await getRanking("colombia", "pt");
    expect(es).toBe(pt);
  });
});
