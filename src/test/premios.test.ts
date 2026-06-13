import { beforeEach, describe, expect, it, vi } from "vitest";
import { premios } from "@/mocks";
import { getPremios } from "@/lib/content/premios";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getPremios", () => {
  it("maps the Payload global and resolves downloads through DownloadFiles", async () => {
    const findGlobal = vi.fn().mockResolvedValue({
      title: "Payload Premios",
      intro: "Payload intro",
      orderEmail: "payload@example.com",
      priceNotice: "Payload price notice",
      trophies: [
        {
          name: "Payload Trophy",
          description: "Payload trophy description",
          price: "123 US/€",
          imageTodo: "Payload image",
        },
      ],
      shipping: {
        heading: "Payload shipping",
        note: "Payload shipping note",
        rows: [{ label: "Payload row", price: "45 US/€" }],
      },
      sections: [
        {
          heading: "Payload section",
          items: [{ title: "Payload item", body: "Payload body" }],
        },
      ],
      downloads: {
        esDownloadKey: "replicas_Orden_de_Compra",
        ptDownloadKey: "replicas_Orden_de_Compra",
      },
    });
    const find = vi
      .fn()
      .mockResolvedValueOnce({
        docs: [
          {
            label: "Payload ES download",
            file: { url: "/media/replicas-es.pdf" },
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            label: "Payload PT download",
            fileUrl: "/media/replicas-pt.docx",
          },
        ],
      });

    mockGetPayloadClient.mockResolvedValue({
      findGlobal,
      find,
    } as any);

    const result = await getPremios("es");

    expect(findGlobal).toHaveBeenCalledWith({
      slug: "premios-global",
      locale: "es",
      depth: 0,
    });
    expect(find).toHaveBeenNthCalledWith(1, {
      collection: "download-files",
      where: {
        and: [
          { active: { equals: true } },
          { key: { equals: "replicas_Orden_de_Compra" } },
          { language: { equals: "es" } },
        ],
      },
      limit: 1,
      depth: 1,
    });
    expect(find).toHaveBeenNthCalledWith(2, {
      collection: "download-files",
      where: {
        and: [
          { active: { equals: true } },
          { key: { equals: "replicas_Orden_de_Compra" } },
          { language: { equals: "pt" } },
        ],
      },
      limit: 1,
      depth: 1,
    });
    expect(result).toEqual({
      title: "Payload Premios",
      intro: "Payload intro",
      orderEmail: "payload@example.com",
      priceNotice: "Payload price notice",
      trophies: [
        {
          name: "Payload Trophy",
          description: "Payload trophy description",
          price: "123 US/€",
          imageTodo: "Payload image",
        },
      ],
      shipping: {
        heading: "Payload shipping",
        note: "Payload shipping note",
        rows: [{ label: "Payload row", price: "45 US/€" }],
      },
      sections: [
        {
          heading: "Payload section",
          items: [{ title: "Payload item", body: "Payload body" }],
        },
      ],
      downloads: {
        es: { label: "Payload ES download", href: "/media/replicas-es.pdf" },
        pt: { label: "Payload PT download", href: "/media/replicas-pt.docx" },
      },
    });
  });

  it("falls back to mocks when Payload is unavailable", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    await expect(getPremios("es")).resolves.toEqual(premios);
  });

  it("falls back to mocks when the global query fails", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    await expect(getPremios("es")).resolves.toEqual(premios);
  });

  it("keeps mock downloads when DownloadFiles has no matching document", async () => {
    mockGetPayloadClient.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        title: "Payload Premios",
        intro: "Payload intro",
        orderEmail: "payload@example.com",
        priceNotice: "Payload price notice",
        trophies: [
          {
            name: "Payload Trophy",
            description: "Payload trophy description",
            price: "123 US/€",
          },
        ],
        shipping: {
          heading: "Payload shipping",
          rows: [{ label: "Payload row", price: "45 US/€" }],
        },
        sections: [
          {
            heading: "Payload section",
            items: [{ title: "Payload item", body: "Payload body" }],
          },
        ],
        downloads: {
          esDownloadKey: "missing-es",
          ptDownloadKey: "missing-pt",
        },
      }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const result = await getPremios("es");

    expect(result.title).toBe("Payload Premios");
    expect(result.downloads).toEqual(premios.downloads);
  });
});
