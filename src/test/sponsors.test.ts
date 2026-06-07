import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSponsors } from "@/lib/content/sponsors";

// Mock Payload client — tests control what payload.find() returns
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

// ---------------------------------------------------------------------------
// 1. Payload devuelve docs válidos → mapping real
// ---------------------------------------------------------------------------
describe("getSponsors (Payload con docs válidos)", () => {
  it("mapea name, url y logoUrl correctamente desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { name: "Test Sponsor", url: "https://example.com", logo: null },
        ],
      }),
    } as any);

    const sponsors = await getSponsors();

    expect(sponsors).toHaveLength(1);
    expect(sponsors[0].name).toBe("Test Sponsor");
    expect(sponsors[0].url).toBe("https://example.com");
    // logoUrl es null porque aún no hay assets reales
    expect(sponsors[0].logoUrl).toBeNull();
  });

  it("falla si name queda vacío (mutación name: '')", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { name: "Real Sponsor", url: "https://real.com", logo: null },
        ],
      }),
    } as any);

    const sponsors = await getSponsors();

    // Este assertion protege el mapping: si name muta a "", el test falla
    expect(sponsors[0].name).not.toBe("");
    expect(sponsors[0].name).toBe("Real Sponsor");
  });

  it("mapea múltiples sponsors desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { name: "Sponsor A", url: "https://a.com", logo: null },
          { name: "Sponsor B", url: null, logo: null },
        ],
      }),
    } as any);

    const sponsors = await getSponsors();

    expect(sponsors).toHaveLength(2);
    expect(sponsors[0].name).toBe("Sponsor A");
    expect(sponsors[1].name).toBe("Sponsor B");
    expect(sponsors[1].url).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Payload devuelve docs vacío → fallback al mock
// ---------------------------------------------------------------------------
describe("getSponsors (Payload docs vacío → fallback)", () => {
  it("retorna sponsors del mock cuando Payload devuelve docs vacío", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const sponsors = await getSponsors();

    expect(sponsors).toBeInstanceOf(Array);
    expect(sponsors.length).toBeGreaterThanOrEqual(1);
    const names = sponsors.map((s) => s.name);
    expect(names).toContain("AEVEA");
  });
});

// ---------------------------------------------------------------------------
// 3. Payload tira error → fallback al mock
// ---------------------------------------------------------------------------
describe("getSponsors (Payload error → fallback)", () => {
  it("retorna sponsors del mock cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    const sponsors = await getSponsors();

    expect(sponsors).toBeInstanceOf(Array);
    expect(sponsors.length).toBeGreaterThanOrEqual(1);
    const names = sponsors.map((s) => s.name);
    expect(names).toContain("AEVEA");
  });
});

// ---------------------------------------------------------------------------
// 4. Fallback mock original (sin Payload mockeado)
// ---------------------------------------------------------------------------
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
