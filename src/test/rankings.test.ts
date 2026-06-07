import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRankingEntries } from "@/lib/content/rankings";

// Mock Payload client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getRankingEntries (Payload con docs)", () => {
  it("mapea correctamente los docs de Payload al shape público", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            country: "Colombia",
            countrySlug: "colombia",
            year: 2024,
            position: 1,
            agency: "Publictv",
            granPrix: 2,
            oro: 21,
            plata: 18,
            bronce: 18,
            total: 59,
            order: 1,
          },
        ],
      }),
    } as any);

    const rankings = await getRankingEntries();

    expect(rankings).toHaveLength(1);
    expect(rankings[0]).toEqual({
      country: "Colombia",
      countrySlug: "colombia",
      year: 2024,
      position: 1,
      agency: "Publictv",
      granPrix: 2,
      oro: 21,
      plata: 18,
      bronce: 18,
      total: 59,
      order: 1,
    });
  });
});

describe("getRankingEntries (Fallback a mocks)", () => {
  it("retorna mocks aplanados cuando Payload devuelve docs vacíos", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const rankings = await getRankingEntries();
    expect(rankings.length).toBeGreaterThan(0);
    const col1 = rankings.find(r => r.countrySlug === "colombia" && r.position === 1);
    expect(col1).toBeDefined();
    expect(col1?.agency).toBe("Publictv");
  });

  it("retorna mocks aplanados cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const rankings = await getRankingEntries();
    expect(rankings.length).toBeGreaterThan(0);
  });
});
