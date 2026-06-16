import { describe, it, expect } from "vitest";
import { getHomeContent } from "@/lib/content/home";
import { home } from "@/mocks";

describe("getHomeContent", () => {
  it("returns the static home mock", async () => {
    const result = await getHomeContent();
    expect(result).toBe(home);
  });

  it("returns an object with a hero section", async () => {
    const result = await getHomeContent();
    expect(result).toHaveProperty("hero");
    expect(result.hero).toHaveProperty("titleLead");
    expect(result.hero).toHaveProperty("highlight");
  });

  it("hero has valid ctaHref", async () => {
    const result = await getHomeContent();
    expect(typeof result.hero.ctaHref).toBe("string");
    expect(result.hero.ctaHref.length).toBeGreaterThan(0);
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getHomeContent("es");
    const pt = await getHomeContent("pt");
    expect(es).toBe(pt);
  });
});
