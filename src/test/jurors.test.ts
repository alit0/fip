import { describe, it, expect, vi, beforeEach } from "vitest";
import { getJurors } from "@/lib/content/jurors";

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
describe("getJurors (Payload con docs válidos)", () => {
  it("mapea name, country, role, agency y slug correctamente desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            name: "Agustin Herrero",
            country: "Chile",
            role: "Director Creativo",
            agency: "Test Agency",
            photo: null,
          },
        ],
      }),
    } as any);

    const jurors = await getJurors();

    expect(jurors).toHaveLength(1);
    expect(jurors[0].name).toBe("Agustin Herrero");
    expect(jurors[0].country).toBe("Chile");
    expect(jurors[0].role).toBe("Director Creativo");
    expect(jurors[0].agency).toBe("Test Agency");
    expect(jurors[0].slug).toBe("agustin-herrero");
    // photoUrl es null porque aún no hay assets reales
    expect(jurors[0].photoUrl).toBeNull();
  });

  it("genera slug a partir del name (lowercase, guiones)", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { name: "Roberto Caro Aguirre", country: "Colombia", role: null, agency: null },
        ],
      }),
    } as any);

    const jurors = await getJurors();

    expect(jurors[0].slug).toBe("roberto-caro-aguirre");
  });

  it("mapea múltiples jurados desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { name: "Jurado A", country: "Argentina", role: null, agency: null },
          { name: "Jurado B", country: "Brasil", role: "CEO", agency: "Agencia X" },
        ],
      }),
    } as any);

    const jurors = await getJurors();

    expect(jurors).toHaveLength(2);
    expect(jurors[0].name).toBe("Jurado A");
    expect(jurors[1].name).toBe("Jurado B");
    expect(jurors[1].role).toBe("CEO");
    expect(jurors[1].agency).toBe("Agencia X");
  });
});

// ---------------------------------------------------------------------------
// 2. Payload devuelve docs vacío → fallback al mock
// ---------------------------------------------------------------------------
describe("getJurors (Payload docs vacío → fallback)", () => {
  it("retorna jurados del mock cuando Payload devuelve docs vacío", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const jurors = await getJurors();

    expect(jurors).toBeInstanceOf(Array);
    expect(jurors.length).toBeGreaterThanOrEqual(1);
    const names = jurors.map((j) => j.name);
    expect(names).toContain("Agustin Herrero");
  });
});

// ---------------------------------------------------------------------------
// 3. Payload tira error → fallback al mock
// ---------------------------------------------------------------------------
describe("getJurors (Payload error → fallback)", () => {
  it("retorna jurados del mock cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    const jurors = await getJurors();

    expect(jurors).toBeInstanceOf(Array);
    expect(jurors.length).toBeGreaterThanOrEqual(1);
    const names = jurors.map((j) => j.name);
    expect(names).toContain("Agustin Herrero");
  });
});

// ---------------------------------------------------------------------------
// 4. Payload null → fallback al mock
// ---------------------------------------------------------------------------
describe("getJurors (Payload null → fallback)", () => {
  it("retorna jurados del mock cuando getPayloadClient devuelve null", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    const jurors = await getJurors();

    expect(jurors).toBeInstanceOf(Array);
    expect(jurors.length).toBeGreaterThanOrEqual(1);
    expect(jurors[0]).toHaveProperty("name");
    expect(jurors[0]).toHaveProperty("country");
    expect(jurors[0]).toHaveProperty("slug");
  });
});

// ---------------------------------------------------------------------------
// 5. Fallback mock original (sin Payload mockeado)
// ---------------------------------------------------------------------------
describe("getJurors (fallback mock)", () => {
  it("devuelve los jurados del mock cuando no hay Payload/DB", async () => {
    const jurors = await getJurors();
    expect(jurors).toBeInstanceOf(Array);
    expect(jurors.length).toBeGreaterThanOrEqual(1);
    expect(jurors[0]).toHaveProperty("name");
    expect(jurors[0]).toHaveProperty("country");
    expect(jurors[0]).toHaveProperty("slug");
    expect(jurors[0]).toHaveProperty("photoUrl");
  });

  it("incluye jurado conocido del mock (Agustin Herrero)", async () => {
    const jurors = await getJurors();
    const names = jurors.map((j) => j.name);
    expect(names).toContain("Agustin Herrero");
  });
});
