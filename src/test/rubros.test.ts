import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRubros } from "@/lib/content/rubros";

// Mock Payload client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getRubros (Payload con docs)", () => {
  it("mapea correctamente los docs de Payload al shape público", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            number: 1,
            code: "MP",
            name: "Marketing Promocional",
            description: "Desc MP",
            order: 1,
            edition: { year: 2026 },
          },
        ],
      }),
    } as any);

    const rubros = await getRubros();

    expect(rubros).toHaveLength(1);
    expect(rubros[0]).toEqual({
      number: 1,
      code: "MP",
      name: "Marketing Promocional",
      description: "Desc MP",
      order: 1,
      editionYear: 2026,
      href: "/categorias#rubro-1",
    });
  });

  it("usa fallback de editionYear 2026 si la relación no está expandida", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            number: 2,
            code: "E",
            name: "Eventos",
            order: 2,
            edition: "some-id",
          },
        ],
      }),
    } as any);

    const rubros = await getRubros();
    expect(rubros[0].editionYear).toBe(2026);
  });
});

describe("getRubros (Fallback a mocks)", () => {
  it("retorna mocks mapeados cuando Payload devuelve docs vacíos", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const rubros = await getRubros();
    expect(rubros.length).toBeGreaterThan(0);
    expect(rubros[0].code).toBe("MP");
    expect(rubros[0].editionYear).toBe(2026);
  });

  it("retorna mocks mapeados cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const rubros = await getRubros();
    expect(rubros.length).toBeGreaterThan(0);
  });
});
