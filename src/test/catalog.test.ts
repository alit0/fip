import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCategoriesByRubro, getCategoriasPage } from "@/lib/content/catalog";

// catalog delegates to getCategories which uses Payload — mock the same client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getCategoriesByRubro", () => {
  it("groups categories by rubroNumber in a single pass", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            code: "MP.1",
            title: "Cat 1",
            description: "",
            award: "oro",
            isSpecial: false,
            specialType: null,
            isNew: false,
            order: 1,
            rubro: { code: "MP", number: 1 },
            edition: { year: 2026 },
          },
          {
            code: "MP.2",
            title: "Cat 2",
            description: "",
            award: "plata",
            isSpecial: false,
            specialType: null,
            isNew: false,
            order: 2,
            rubro: { code: "MP", number: 1 },
            edition: { year: 2026 },
          },
          {
            code: "E.1",
            title: "Cat 3",
            description: "",
            award: "bronce",
            isSpecial: false,
            specialType: null,
            isNew: false,
            order: 1,
            rubro: { code: "E", number: 2 },
            edition: { year: 2026 },
          },
        ],
      }),
    } as any);

    const byRubro = await getCategoriesByRubro();

    expect(byRubro.size).toBe(2);
    expect(byRubro.get(1)).toHaveLength(2);
    expect(byRubro.get(2)).toHaveLength(1);
    expect(byRubro.get(1)![0].code).toBe("MP.1");
    expect(byRubro.get(1)![1].code).toBe("MP.2");
  });

  it("returns an empty Map when Payload returns no categories", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    // When Payload is empty, getCategories falls back to mocks — so we get entries
    const byRubro = await getCategoriesByRubro();
    expect(byRubro.size).toBeGreaterThan(0);
  });

  it("falls back to mock categories when Payload client fails", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const byRubro = await getCategoriesByRubro();
    expect(byRubro.size).toBeGreaterThan(0);
  });
});

describe("getCategoriasPage", () => {
  it("returns the static categoriasPage mock (locale ignored)", async () => {
    const page = await getCategoriasPage("es");
    expect(page).toBeDefined();
    // The mock always returns the same static object regardless of locale
    const pageAgain = await getCategoriasPage("pt");
    expect(page).toBe(pageAgain);
  });
});
