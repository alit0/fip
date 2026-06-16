import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCategories } from "@/lib/content/categories";

// Mock Payload client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getCategories (Payload con docs)", () => {
  it("mapea correctamente los docs de Payload al shape público", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            code: "MP.1",
            title: "Cat 1",
            description: "Desc 1",
            award: "oro",
            isSpecial: false,
            specialType: null,
            isNew: false,
            order: 1,
            rubro: { code: "MP", number: 1 },
            edition: { year: 2026 },
          },
        ],
      }),
    } as any);

    const categories = await getCategories();

    expect(categories).toHaveLength(1);
    expect(categories[0]).toEqual({
      code: "MP.1",
      title: "Cat 1",
      description: "Desc 1",
      award: "oro",
      isSpecial: false,
      specialType: null,
      isNew: false,
      order: 1,
      rubroCode: "MP",
      rubroNumber: 1,
      editionYear: 2026,
    });
  });

  it("maneja relaciones no expandidas con fallbacks seguros", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            code: "E.1",
            title: "Cat E",
            order: 2,
            rubro: "some-rubro-id",
            edition: "some-edition-id",
          },
        ],
      }),
    } as any);

    const categories = await getCategories();
    expect(categories[0].rubroCode).toBe("");
    expect(categories[0].rubroNumber).toBe(0);
    expect(categories[0].editionYear).toBe(2026);
  });
});

describe("getCategories (Fallback a mocks)", () => {
  it("retorna mocks mapeados cuando Payload devuelve docs vacíos", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const categories = await getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].code).toBe("MP.1");
    expect(categories[0].editionYear).toBe(2026);
  });

  it("retorna mocks mapeados cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const categories = await getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });
});
