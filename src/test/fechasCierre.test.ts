import { beforeEach, describe, expect, it, vi } from "vitest";
import { fechasCierre } from "@/mocks";
import { getFechasCierre } from "@/lib/content/fechas-cierre";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getFechasCierre", () => {
  it("maps the Payload global", async () => {
    const findGlobal = vi.fn().mockResolvedValue({
      title: "Payload Fechas",
      intro: "Payload intro",
      discounts: {
        heading: "Payload discounts",
        rows: [
          {
            descuento: "-15%",
            tipo: "Payload tipo",
            condicion: "Payload condición",
            vigencia: "Payload vigencia",
          },
        ],
      },
      closings: {
        heading: "Payload closings",
        regions: [
          {
            label: "Payload region",
            detail: "Payload detail",
            date: "1 de enero",
          },
        ],
        milestones: [
          {
            label: "Payload milestone",
            detail: "Payload milestone detail",
            date: "2 de enero",
          },
        ],
        note: "Payload note",
      },
    });

    mockGetPayloadClient.mockResolvedValue({ findGlobal } as any);

    const result = await getFechasCierre("es");

    expect(findGlobal).toHaveBeenCalledWith({
      slug: "fechas-global",
      locale: "es",
      depth: 0,
    });
    expect(result).toEqual({
      title: "Payload Fechas",
      intro: "Payload intro",
      discounts: {
        heading: "Payload discounts",
        rows: [
          {
            descuento: "-15%",
            tipo: "Payload tipo",
            condicion: "Payload condición",
            vigencia: "Payload vigencia",
          },
        ],
      },
      closings: {
        heading: "Payload closings",
        regions: [
          {
            label: "Payload region",
            detail: "Payload detail",
            date: "1 de enero",
          },
        ],
        milestones: [
          {
            label: "Payload milestone",
            detail: "Payload milestone detail",
            date: "2 de enero",
          },
        ],
        note: "Payload note",
      },
    });
  });

  it("falls back to mocks when Payload is unavailable", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    await expect(getFechasCierre("es")).resolves.toEqual(fechasCierre);
  });

  it("falls back to mocks when the global query fails", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    await expect(getFechasCierre("es")).resolves.toEqual(fechasCierre);
  });

  it("keeps mock nested sections when Payload data is incomplete", async () => {
    mockGetPayloadClient.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        title: "Payload Fechas",
        discounts: { heading: "Payload discounts", rows: [] },
        closings: { heading: "Payload closings", regions: [], milestones: [] },
      }),
    } as any);

    const result = await getFechasCierre("es");

    expect(result.title).toBe("Payload Fechas");
    expect(result.discounts).toEqual(fechasCierre.discounts);
    expect(result.closings.regions).toEqual(fechasCierre.closings.regions);
    expect(result.closings.milestones).toEqual(fechasCierre.closings.milestones);
  });
});
