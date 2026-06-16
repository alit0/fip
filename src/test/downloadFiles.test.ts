import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadFiles } from "@/lib/content/downloadFiles";

// Mock Payload client
vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getDownloadFiles (Payload con docs)", () => {
  it("mapea correctamente los docs de Payload al shape público", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            key: "test-pdf",
            label: "Test PDF",
            language: "es",
            format: "pdf",
            file: { url: "/media/test.pdf" },
            section: "footer",
            order: 1,
            active: true,
          },
        ],
      }),
    } as any);

    const files = await getDownloadFiles("es");
    expect(files).toHaveLength(1);
    expect(files[0].key).toBe("test-pdf");
    expect(files[0].fileUrl).toBe("/media/test.pdf");
  });

  it("usa fileUrl si file relation no está presente", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            key: "test-pdf-2",
            label: "Test PDF 2",
            language: "es",
            format: "pdf",
            fileUrl: "/descargas/test2.pdf",
            section: "footer",
            order: 2,
            active: true,
          },
        ],
      }),
    } as any);

    const files = await getDownloadFiles("es");
    expect(files).toHaveLength(1);
    expect(files[0].fileUrl).toBe("/descargas/test2.pdf");
  });
});

describe("getDownloadFiles (Fallback a mocks)", () => {
  it("retorna solo archivos ES cuando Payload devuelve docs vacíos y locale=es", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const files = await getDownloadFiles("es");
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => f.language === "es")).toBe(true);
  });

  it("retorna archivos PT cuando locale=pt y hay mocks PT", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const files = await getDownloadFiles("pt");
    expect(files.length).toBeGreaterThan(0);
    // All returned files belong to the requested locale (or ES fallback if no PT mocks)
    const allSameLang = files.every((f) => f.language === "es" || f.language === "pt");
    expect(allSameLang).toBe(true);
  });

  it("retorna mocks cuando getPayloadClient falla, ordenados por section y order", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const files = await getDownloadFiles("es");
    expect(files.length).toBeGreaterThan(0);

    // Check sorting: section first, then order within section
    for (let i = 1; i < files.length; i++) {
      const a = files[i - 1];
      const b = files[i];
      if (a.section === b.section) {
        expect(a.order).toBeLessThanOrEqual(b.order);
      } else {
        expect(a.section.localeCompare(b.section)).toBeLessThanOrEqual(0);
      }
    }
  });

  it("aplica fallback ES cuando Payload falla y locale=pt pero no hay mocks PT", async () => {
    // Simulate: Payload fails, and we pass pt locale
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const files = await getDownloadFiles("pt");
    // Should return some files (either pt or es fallback)
    expect(files.length).toBeGreaterThan(0);
  });
});
