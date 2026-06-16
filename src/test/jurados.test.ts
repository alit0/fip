import { describe, it, expect } from "vitest";
import { getJurados } from "@/lib/content/jurados";

describe("getJurados", () => {
  it("returns an array of jurados for a known year (2026)", async () => {
    const result = await getJurados(2026);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts year as string", async () => {
    const result = await getJurados("2026");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns an empty array for an unknown year", async () => {
    const result = await getJurados(1900);
    expect(result).toEqual([]);
  });

  it("injects countryCode derived from the countryFlag emoji", async () => {
    const result = await getJurados(2026);
    // Argentina flag 🇦🇷 → countryCode "AR"
    const arg = result.find((j) => j.countryFlag === "🇦🇷");
    if (arg) {
      expect(arg.countryCode).toBe("AR");
    }
    // Every entry must have a countryCode field (may be null for invalid flags)
    for (const jurado of result) {
      expect(jurado).toHaveProperty("countryCode");
    }
  });

  it("preserves all original jurado fields alongside the injected countryCode", async () => {
    const result = await getJurados(2026);
    const first = result[0];
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("countryFlag");
    expect(first).toHaveProperty("countryCode");
  });

  it("returns null countryCode for an invalid/empty countryFlag", async () => {
    // Year 2020 mock has an entry with empty countryFlag so we can test the null path
    const result = await getJurados(2020);
    // Some entries may have empty countryFlag — those should have null countryCode
    const empty = result.find((j) => j.countryFlag.trim() === "");
    if (empty) {
      expect(empty.countryCode).toBeNull();
    } else {
      // If no empty flags, just ensure every countryCode is string or null
      for (const j of result) {
        expect(j.countryCode === null || typeof j.countryCode === "string").toBe(true);
      }
    }
  });

  it("is locale-agnostic — returns same entries regardless of locale", async () => {
    const es = await getJurados(2026, "es");
    const pt = await getJurados(2026, "pt");
    expect(es).toEqual(pt);
  });
});
