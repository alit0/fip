import { describe, it, expect } from "vitest";
import { getReglamento } from "@/lib/content/reglamento";
import { reglamento } from "@/mocks";

describe("getReglamento", () => {
  it("returns the static reglamento mock", async () => {
    const result = await getReglamento();
    expect(result).toBe(reglamento);
  });

  it("has an intro field", async () => {
    const result = await getReglamento();
    expect(result).toHaveProperty("intro");
    expect(typeof result.intro).toBe("string");
    expect(result.intro.length).toBeGreaterThan(0);
  });

  it("has a downloads object with es and pt entries", async () => {
    const result = await getReglamento();
    expect(result).toHaveProperty("downloads");
    expect(result.downloads).toHaveProperty("es");
    expect(result.downloads).toHaveProperty("pt");
    expect(typeof result.downloads.es.href).toBe("string");
    expect(typeof result.downloads.pt.href).toBe("string");
  });

  it("has a scoreTable array", async () => {
    const result = await getReglamento();
    expect(result).toHaveProperty("scoreTable");
    expect(Array.isArray(result.scoreTable)).toBe(true);
    expect(result.scoreTable.length).toBeGreaterThan(0);
  });

  it("scoreTable entries have award and points", async () => {
    const result = await getReglamento();
    for (const entry of result.scoreTable) {
      expect(entry).toHaveProperty("award");
      expect(entry).toHaveProperty("points");
    }
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getReglamento("es");
    const pt = await getReglamento("pt");
    expect(es).toBe(pt);
  });
});
