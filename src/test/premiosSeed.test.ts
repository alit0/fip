import { describe, expect, it, vi } from "vitest";
import { premios } from "@/mocks";
import {
  PREMIOS_GLOBAL_SEED,
  isPremiosGlobalSeeded,
  seedPremiosGlobal,
} from "../../scripts/premios-seed-data";

describe("PREMIOS_GLOBAL_SEED", () => {
  it("serializes the mock Premios contract into a Payload global seed", () => {
    expect(PREMIOS_GLOBAL_SEED).toMatchObject({
      title: premios.title,
      intro: premios.intro,
      orderEmail: premios.orderEmail,
      priceNotice: premios.priceNotice,
      downloads: {
        esDownloadKey: "replicas_Orden_de_Compra",
        ptDownloadKey: "replicas_Orden_de_Compra",
      },
    });
    expect(PREMIOS_GLOBAL_SEED.trophies).toHaveLength(premios.trophies.length);
    expect(PREMIOS_GLOBAL_SEED.shipping.rows).toEqual(premios.shipping.rows);
    expect(PREMIOS_GLOBAL_SEED.sections).toEqual(premios.sections);
  });
});

describe("isPremiosGlobalSeeded", () => {
  it("detects empty and meaningful global data", () => {
    expect(isPremiosGlobalSeeded(null)).toBe(false);
    expect(isPremiosGlobalSeeded({ title: "", trophies: [] })).toBe(false);
    expect(isPremiosGlobalSeeded({ title: "Premios" })).toBe(true);
  });
});

describe("seedPremiosGlobal", () => {
  it("creates the global only when it is empty", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({}),
      updateGlobal: vi.fn().mockResolvedValue({}),
    };

    const report = await seedPremiosGlobal(payload);

    expect(payload.findGlobal).toHaveBeenCalledWith({
      slug: "premios-global",
      locale: "es",
      depth: 0,
    });
    expect(payload.updateGlobal).toHaveBeenCalledWith({
      slug: "premios-global",
      locale: "es",
      data: PREMIOS_GLOBAL_SEED,
    });
    expect(report).toEqual({ created: 1, skipped: 0, errors: 0 });
  });

  it("skips an already seeded global", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({ title: "Existing Premios" }),
      updateGlobal: vi.fn(),
    };

    const report = await seedPremiosGlobal(payload);

    expect(payload.updateGlobal).not.toHaveBeenCalled();
    expect(report).toEqual({ created: 0, skipped: 1, errors: 0 });
  });
});
