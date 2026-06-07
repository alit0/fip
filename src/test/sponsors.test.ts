import { describe, it, expect } from "vitest";
import { getSponsors } from "@/lib/content/sponsors";

describe("getSponsors (fallback mock)", () => {
  it("devuelve los sponsors del mock cuando no hay Payload/DB", async () => {
    const sponsors = await getSponsors();
    expect(sponsors).toBeInstanceOf(Array);
    expect(sponsors.length).toBeGreaterThanOrEqual(1);
    expect(sponsors[0]).toHaveProperty("name");
    expect(sponsors[0]).toHaveProperty("logoUrl");
    expect(sponsors[0]).toHaveProperty("url");
  });

  it("incluye sponsor conocido del mock (AEVEA)", async () => {
    const sponsors = await getSponsors();
    const names = sponsors.map((s) => s.name);
    expect(names).toContain("AEVEA");
  });
});
