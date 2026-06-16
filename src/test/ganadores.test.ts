import { describe, it, expect } from "vitest";
import { getGanadores } from "@/lib/content/ganadores";

describe("getGanadores", () => {
  it("returns a GanadoresYear object for a known year (2025)", async () => {
    const result = await getGanadores(2025);
    expect(result).not.toBeNull();
    expect(result!.year).toBe(2025);
  });

  it("accepts year as string", async () => {
    const result = await getGanadores("2025");
    expect(result).not.toBeNull();
    expect(result!.year).toBe(2025);
  });

  it("returns null for an unknown year", async () => {
    const result = await getGanadores(1900);
    expect(result).toBeNull();
  });

  it("the returned object has a completeness field", async () => {
    const result = await getGanadores(2025);
    expect(result).toHaveProperty("completeness");
  });

  it("is locale-agnostic — returns same data regardless of locale", async () => {
    const es = await getGanadores(2025, "es");
    const pt = await getGanadores(2025, "pt");
    expect(es).toBe(pt);
  });
});
