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
  it("retorna mocks cuando Payload devuelve docs vacíos", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const files = await getDownloadFiles("es");
    expect(files.length).toBeGreaterThan(0);
    const hasEs = files.some((f) => f.language === "es");
    const hasPt = files.some((f) => f.language === "pt");
    expect(hasEs).toBe(true);
    expect(hasPt).toBe(true);
  });

  it("retorna mocks cuando getPayloadClient falla, ordenados por section, language, order", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB Down"));

    const files = await getDownloadFiles("es");
    expect(files.length).toBeGreaterThan(0);
    
    // Check sorting
    for (let i = 1; i < files.length; i++) {
      const a = files[i - 1];
      const b = files[i];
      if (a.section === b.section) {
        if (a.language === b.language) {
          expect(a.order).toBeLessThanOrEqual(b.order);
        } else {
          expect(a.language.localeCompare(b.language)).toBeLessThanOrEqual(0);
        }
      } else {
        expect(a.section.localeCompare(b.section)).toBeLessThanOrEqual(0);
      }
    }
  });
});
