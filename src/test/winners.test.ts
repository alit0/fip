import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWinners } from "@/lib/content/winners";

// Mock Payload client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getWinners (Payload con docs)", () => {
  it("mapea correctamente los docs de Payload al shape público", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            edition: { year: 2025 },
            rubro: { code: "MP", number: 1 },
            category: { code: "MP.1", title: "Promo 1" },
            awardLevel: "oro",
            campaign: "Campaña X",
            brand: "Marca Y",
            agency: "Agencia Z",
            country: "Argentina",
            isGrandReco: false,
            order: 1,
          },
        ],
      }),
    } as any);

    const winners = await getWinners();

    expect(winners).toHaveLength(1);
    expect(winners[0]).toEqual({
      editionYear: 2025,
      rubroCode: "MP",
      rubroNumber: 1,
      categoryCode: "MP.1",
      categoryTitle: "Promo 1",
      awardLevel: "oro",
      specialAwardName: null,
      campaign: "Campaña X",
      brand: "Marca Y",
      agency: "Agencia Z",
      country: "Argentina",
      isGrandReco: false,
      order: 1,
    });
  });

  it("maneja relaciones no expandidas con fallbacks seguros", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            edition: "ed-id",
            rubro: "ru-id",
            category: "ca-id",
            awardLevel: "oro",
            campaign: "X",
            agency: "Y",
            country: "Z",
          },
        ],
      }),
    } as any);

    const winners = await getWinners();
    expect(winners[0].editionYear).toBe(2026);
    expect(winners[0].rubroCode).toBe("");
    expect(winners[0].categoryCode).toBe("");
  });
});

describe("getWinners (Fallback a mocks)", () => {
  it("retorna mocks aplanados cuando Payload devuelve docs vacíos", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const winners = await getWinners();
    expect(winners.length).toBeGreaterThan(0);
    // Check for some flattened year
    const w2025 = winners.find(w => w.editionYear === 2025);
    expect(w2025).toBeDefined();
  });

  it("retorna mocks aplanados cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const winners = await getWinners();
    expect(winners.length).toBeGreaterThan(0);
  });
});
