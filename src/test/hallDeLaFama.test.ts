import { describe, it, expect } from "vitest";
import { getHallDeLaFama } from "@/lib/content/hall-de-la-fama";
import { hallDeLaFama } from "@/mocks";

describe("getHallDeLaFama", () => {
  it("returns the static hallDeLaFama mock", async () => {
    const result = await getHallDeLaFama();
    expect(result).toBe(hallDeLaFama);
  });

  it("returns an object with title and institutional fields", async () => {
    const result = await getHallDeLaFama();
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("institutional");
    expect(Array.isArray(result.institutional)).toBe(true);
  });

  it("institutional entries have title and body", async () => {
    const result = await getHallDeLaFama();
    expect(result.institutional.length).toBeGreaterThan(0);
    for (const entry of result.institutional) {
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("body");
    }
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getHallDeLaFama("es");
    const pt = await getHallDeLaFama("pt");
    expect(es).toBe(pt);
  });
});
