import { describe, it, expect } from "vitest";
import { getContacto } from "@/lib/content/contacto";
import { contacto } from "@/mocks";

describe("getContacto", () => {
  it("returns the static contacto mock", async () => {
    const result = await getContacto();
    expect(result).toBe(contacto);
  });

  it("returns an object with title and people fields", async () => {
    const result = await getContacto();
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("people");
    expect(Array.isArray(result.people)).toBe(true);
  });

  it("people entries have role, name and email fields", async () => {
    const result = await getContacto();
    expect(result.people.length).toBeGreaterThan(0);
    for (const person of result.people) {
      expect(person).toHaveProperty("role");
      expect(person).toHaveProperty("name");
      expect(person).toHaveProperty("email");
    }
  });

  it("is locale-agnostic — returns same object regardless of locale", async () => {
    const es = await getContacto("es");
    const pt = await getContacto("pt");
    expect(es).toBe(pt);
  });
});
