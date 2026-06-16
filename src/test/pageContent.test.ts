import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPageContent,
  richTextToString,
} from "@/lib/content/pageContent";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from "@/lib/payload";
const mockGetPayloadClient = vi.mocked(getPayloadClient);

beforeEach(() => {
  mockGetPayloadClient.mockReset();
});

describe("getPageContent", () => {
  it("maps active Payload docs to the public contract", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            pageKey: "home",
            sectionKey: "institutional-intro",
            title: "Institutional",
            body: {
              root: {
                children: [
                  {
                    children: [{ text: "First paragraph." }],
                  },
                  {
                    children: [{ text: "Second paragraph." }],
                  },
                ],
              },
            },
            image: { url: "/media/home.jpg" },
            order: 0,
            active: true,
          },
        ],
      }),
    } as any);

    const content = await getPageContent("home", "es");

    expect(content).toEqual([
      {
        pageKey: "home",
        sectionKey: "institutional-intro",
        title: "Institutional",
        body: "First paragraph.\n\nSecond paragraph.",
        imageUrl: "/media/home.jpg",
        order: 0,
        active: true,
      },
    ]);
  });

  it("returns Home institutional fallback when Payload has no docs", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const content = await getPageContent("home", "es");

    expect(content.length).toBeGreaterThan(0);
    expect(content[0]).toMatchObject({
      pageKey: "home",
      sectionKey: "institutional-intro",
      active: true,
    });
  });

  it("returns an empty fallback for unknown pages", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    await expect(getPageContent("unknown", "es")).resolves.toEqual([]);
  });
});

describe("richTextToString", () => {
  it("converts nested Lexical text nodes to plain text", () => {
    expect(
      richTextToString({
        root: {
          children: [
            { children: [{ text: "Hello " }, { text: "world" }] },
            { children: [{ text: "Next paragraph" }] },
          ],
        },
      }),
    ).toBe("Hello world\n\nNext paragraph");
  });
});
