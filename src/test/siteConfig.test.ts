import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSiteConfig } from "@/lib/content/site-config";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getSiteConfig", () => {
  it("maps the Payload global to the current public contract", async () => {
    mockGetPayloadClient.mockResolvedValue({
      findGlobal: vi.fn().mockResolvedValue({
        address: "Payload address",
        contactEmails: [{ label: "Info", email: "cms@example.com" }],
        phones: [{ label: "Phone", number: "+54 11 1234 5678" }],
        whatsapps: [{ label: "WhatsApp", number: "+54 9 11 1234 5678" }],
        socialLinks: [{ name: "Instagram", href: "https://example.com/ig" }],
      }),
    } as any);

    const config = await getSiteConfig("es");

    expect(config.contact.address).toBe("Payload address");
    expect(config.contact.email).toBe("cms@example.com");
    expect(config.contact.tel).toBe("+54 11 1234 5678");
    expect(config.contact.whatsapp).toBe("+54 9 11 1234 5678");
    expect(config.social).toEqual([
      { name: "Instagram", href: "https://example.com/ig" },
    ]);
    expect(config.downloads.es.length).toBeGreaterThan(0);
  });

  it("falls back to mocks when the global query fails", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    const config = await getSiteConfig("es");

    expect(config.contact.email).toBe("info@fipfestival.com.ar");
    expect(config.social.length).toBeGreaterThan(0);
  });
});
