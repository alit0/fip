import { describe, expect, it, vi } from "vitest";
import { fechasCierre } from "@/mocks";
import {
  FECHAS_GLOBAL_SEED,
  isFechasGlobalSeeded,
  seedFechasGlobal,
} from "../../scripts/fechas-seed-data";

describe("FECHAS_GLOBAL_SEED", () => {
  it("serializes the mock FechasCierre contract into a Payload global seed", () => {
    expect(FECHAS_GLOBAL_SEED).toMatchObject({
      title: fechasCierre.title,
      intro: fechasCierre.intro,
      discounts: {
        heading: fechasCierre.discounts.heading,
      },
      closings: {
        heading: fechasCierre.closings.heading,
        note: fechasCierre.closings.note,
      },
    });
    expect(FECHAS_GLOBAL_SEED.discounts.rows).toEqual(fechasCierre.discounts.rows);
    expect(FECHAS_GLOBAL_SEED.closings.regions).toEqual(fechasCierre.closings.regions);
    expect(FECHAS_GLOBAL_SEED.closings.milestones).toEqual(fechasCierre.closings.milestones);
  });
});

describe("isFechasGlobalSeeded", () => {
  it("detects empty and meaningful global data", () => {
    expect(isFechasGlobalSeeded(null)).toBe(false);
    expect(isFechasGlobalSeeded({ title: "", discounts: { rows: [] } })).toBe(false);
    expect(isFechasGlobalSeeded({ title: "Fechas" })).toBe(true);
  });
});

describe("seedFechasGlobal", () => {
  it("creates the global only when it is empty", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({}),
      updateGlobal: vi.fn().mockResolvedValue({}),
    };

    const report = await seedFechasGlobal(payload);

    expect(payload.findGlobal).toHaveBeenCalledWith({
      slug: "fechas-global",
      locale: "es",
      depth: 0,
    });
    expect(payload.updateGlobal).toHaveBeenCalledWith({
      slug: "fechas-global",
      locale: "es",
      data: FECHAS_GLOBAL_SEED,
    });
    expect(report).toEqual({ created: 1, skipped: 0, errors: 0 });
  });

  it("skips an already seeded global", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({ title: "Existing Fechas" }),
      updateGlobal: vi.fn(),
    };

    const report = await seedFechasGlobal(payload);

    expect(payload.updateGlobal).not.toHaveBeenCalled();
    expect(report).toEqual({ created: 0, skipped: 1, errors: 0 });
  });
});
