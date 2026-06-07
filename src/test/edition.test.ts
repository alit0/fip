import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentEdition } from "@/lib/content/edition";

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
// 1. Payload devuelve doc actual → mapping real
// ---------------------------------------------------------------------------
describe("getCurrentEdition (Payload con doc actual)", () => {
  it("devuelve los valores del doc cuando Payload tiene una edición actual", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { year: 2026, isCurrent: true, title: "FIP Festival 2026", status: "active" },
        ],
      }),
    } as any);

    const edition = await getCurrentEdition();

    expect(edition.year).toBe(2026);
    expect(edition.isCurrent).toBe(true);
    expect(edition.title).toBe("FIP Festival 2026");
    expect(edition.status).toBe("active");
  });

  it("usa fallback de title si el doc no tiene title", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { year: 2025, isCurrent: true, title: null, status: "draft" },
        ],
      }),
    } as any);

    const edition = await getCurrentEdition();

    expect(edition.year).toBe(2025);
    expect(edition.title).toBe("FIP Festival 2025");
    expect(edition.status).toBe("draft");
  });

  it("devuelve status null si el doc no tiene status", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { year: 2026, isCurrent: true, title: "FIP Festival 2026", status: null },
        ],
      }),
    } as any);

    const edition = await getCurrentEdition();

    expect(edition.status).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Payload docs vacío → fallback 2026
// ---------------------------------------------------------------------------
describe("getCurrentEdition (Payload docs vacío → fallback)", () => {
  it("retorna fallback 2026 cuando Payload devuelve docs vacío", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const edition = await getCurrentEdition();

    expect(edition.year).toBe(2026);
    expect(edition.isCurrent).toBe(true);
    expect(edition.title).toBe("FIP Festival 2026");
    expect(edition.status).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// 3. Payload error → fallback 2026
// ---------------------------------------------------------------------------
describe("getCurrentEdition (Payload error → fallback)", () => {
  it("retorna fallback 2026 cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    const edition = await getCurrentEdition();

    expect(edition.year).toBe(2026);
    expect(edition.isCurrent).toBe(true);
    expect(edition.title).toBe("FIP Festival 2026");
    expect(edition.status).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// 4. Payload null → fallback 2026
// ---------------------------------------------------------------------------
describe("getCurrentEdition (Payload null → fallback)", () => {
  it("retorna fallback 2026 cuando getPayloadClient devuelve null", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    const edition = await getCurrentEdition();

    expect(edition.year).toBe(2026);
    expect(edition.isCurrent).toBe(true);
    expect(edition.title).toBe("FIP Festival 2026");
    expect(edition.status).toBe("active");
  });
});
