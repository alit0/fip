import { describe, it, expect } from "vitest";
import { getTarifario } from "@/lib/content/tarifario";
import { tarifario } from "@/mocks";

describe("getTarifario", () => {
  it("returns the static tarifario mock", async () => {
    const result = await getTarifario();
    expect(result).toBe(tarifario);
  });

  it("returns an object with a title field", async () => {
    const result = await getTarifario();
    expect(result).toHaveProperty("title");
    expect(typeof result.title).toBe("string");
    expect(result.title.length).toBeGreaterThan(0);
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getTarifario("es");
    const pt = await getTarifario("pt");
    expect(es).toBe(pt);
  });
});
