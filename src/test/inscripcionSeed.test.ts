import { describe, expect, it, vi } from "vitest";
import { inscripcion } from "@/mocks";
import {
  INSCRIPCION_GLOBAL_SEED,
  isInscripcionGlobalSeeded,
  seedInscripcionGlobal,
} from "../../scripts/inscripcion-seed-data";

describe("INSCRIPCION_GLOBAL_SEED", () => {
  it("serializes the mock Inscripcion contract into a Payload global seed", () => {
    expect(INSCRIPCION_GLOBAL_SEED).toMatchObject({
      title: inscripcion.title,
      subtitle: inscripcion.subtitle,
      condiciones: inscripcion.condiciones,
      contenido: {
        id: inscripcion.contenido.id,
        title: inscripcion.contenido.title,
        question: inscripcion.contenido.question,
      },
    });
    expect(INSCRIPCION_GLOBAL_SEED.index).toEqual(inscripcion.index);
    expect(INSCRIPCION_GLOBAL_SEED.steps).toHaveLength(inscripcion.steps.length);
    expect(INSCRIPCION_GLOBAL_SEED.steps[0].body).toEqual(
      inscripcion.steps[0].body.map((text) => ({ text })),
    );
    expect(INSCRIPCION_GLOBAL_SEED.contenido.aspects[0].body).toEqual(
      inscripcion.contenido.aspects[0].body.map((text) => ({ text })),
    );
  });
});

describe("isInscripcionGlobalSeeded", () => {
  it("detects empty and meaningful global data", () => {
    expect(isInscripcionGlobalSeeded(null)).toBe(false);
    expect(isInscripcionGlobalSeeded({ title: "", steps: [] })).toBe(false);
    expect(isInscripcionGlobalSeeded({ title: "Inscripción" })).toBe(true);
  });
});

describe("seedInscripcionGlobal", () => {
  it("creates the global only when it is empty", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({}),
      updateGlobal: vi.fn().mockResolvedValue({}),
    };

    const report = await seedInscripcionGlobal(payload);

    expect(payload.findGlobal).toHaveBeenCalledWith({
      slug: "inscripcion-global",
      locale: "es",
      depth: 0,
    });
    expect(payload.updateGlobal).toHaveBeenCalledWith({
      slug: "inscripcion-global",
      locale: "es",
      data: INSCRIPCION_GLOBAL_SEED,
    });
    expect(report).toEqual({ created: 1, skipped: 0, errors: 0 });
  });

  it("skips an already seeded global", async () => {
    const payload = {
      findGlobal: vi.fn().mockResolvedValue({ title: "Existing Inscripción" }),
      updateGlobal: vi.fn(),
    };

    const report = await seedInscripcionGlobal(payload);

    expect(payload.updateGlobal).not.toHaveBeenCalled();
    expect(report).toEqual({ created: 0, skipped: 1, errors: 0 });
  });
});
