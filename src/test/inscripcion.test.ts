import { beforeEach, describe, expect, it, vi } from "vitest";
import { inscripcion } from "@/mocks";
import { getInscripcion } from "@/lib/content/inscripcion";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getInscripcion", () => {
  it("maps the Payload global", async () => {
    const findGlobal = vi.fn().mockResolvedValue({
      title: "Payload Inscripción",
      subtitle: "Payload subtitle",
      index: [{ label: "Payload index", href: "#payload" }],
      steps: [
        {
          id: "payload-step",
          step: "Paso Payload",
          title: "Payload step title",
          body: [{ text: "Payload body" }],
          bullets: [{ text: "Payload bullet" }],
          links: [{ label: "Payload help", href: "#help" }],
          cta: { label: "Payload CTA", href: "/payload" },
          downloads: [{ label: "Payload download", href: "/payload.pdf", lang: "ES" }],
          imageTodo: "Payload image",
        },
      ],
      condiciones: {
        title: "Payload condiciones",
        body: "Payload condiciones body",
      },
      contenido: {
        id: "payload-content",
        title: "Payload content",
        question: "Payload question",
        aspects: [
          {
            number: 1,
            title: "Payload aspect",
            body: [{ text: "Payload aspect body" }],
          },
        ],
      },
    });

    mockGetPayloadClient.mockResolvedValue({ findGlobal } as any);

    const result = await getInscripcion("es");

    expect(findGlobal).toHaveBeenCalledWith({
      slug: "inscripcion-global",
      locale: "es",
      depth: 0,
    });
    expect(result).toEqual({
      title: "Payload Inscripción",
      subtitle: "Payload subtitle",
      index: [{ label: "Payload index", href: "#payload" }],
      steps: [
        {
          id: "payload-step",
          step: "Paso Payload",
          title: "Payload step title",
          body: ["Payload body"],
          bullets: ["Payload bullet"],
          links: [{ text: "Payload help", href: "#help" }],
          cta: { label: "Payload CTA", href: "/payload" },
          downloads: [{ label: "Payload download", href: "/payload.pdf", lang: "ES" }],
          imageTodo: "Payload image",
        },
      ],
      condiciones: {
        title: "Payload condiciones",
        body: "Payload condiciones body",
      },
      contenido: {
        id: "payload-content",
        title: "Payload content",
        question: "Payload question",
        aspects: [
          {
            number: 1,
            title: "Payload aspect",
            body: ["Payload aspect body"],
          },
        ],
      },
    });
  });

  it("falls back to mocks when Payload is unavailable", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    await expect(getInscripcion("es")).resolves.toEqual(inscripcion);
  });

  it("falls back to mocks when the global query fails", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    await expect(getInscripcion("es")).resolves.toEqual(inscripcion);
  });

  it("keeps mock nested sections when Payload data is incomplete", async () => {
    mockGetPayloadClient.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        title: "Payload Inscripción",
        index: [],
        steps: [],
        condiciones: {},
        contenido: { aspects: [] },
      }),
    } as any);

    const result = await getInscripcion("es");

    expect(result.title).toBe("Payload Inscripción");
    expect(result.index).toEqual(inscripcion.index);
    expect(result.steps).toEqual(inscripcion.steps);
    expect(result.condiciones).toEqual(inscripcion.condiciones);
    expect(result.contenido).toEqual(inscripcion.contenido);
  });
});
