import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHallOfFameMembers } from "@/lib/content/hallOfFameMembers";

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
// 1. Payload devuelve docs válidos → mapping real
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (Payload con docs válidos)", () => {
  it("mapea slug, name, country, role, company y bio correctamente desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            slug: "test-member",
            name: "Test Member",
            country: "Argentina",
            countryCode: "AR",
            role: "CEO",
            company: "Test Company",
            bio: "Test biography",
            photo: null,
            logo: null,
            order: 1,
          },
        ],
      }),
    } as any);

    const members = await getHallOfFameMembers();

    expect(members).toHaveLength(1);
    expect(members[0].slug).toBe("test-member");
    expect(members[0].name).toBe("Test Member");
    expect(members[0].country).toBe("Argentina");
    expect(members[0].countryCode).toBe("AR");
    expect(members[0].role).toBe("CEO");
    expect(members[0].company).toBe("Test Company");
    expect(members[0].bioText).toBe("Test biography");
    expect(members[0].order).toBe(1);
    // photoUrl y logoTodo son null porque aún no hay assets reales
    expect(members[0].photoUrl).toBeNull();
    expect(members[0].logoTodo).toBeNull();
  });

  it("mapea múltiples miembros desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { slug: "member-a", name: "Member A", country: "México", countryCode: "MX", role: "", company: "", bio: "", order: 1 },
          { slug: "member-b", name: "Member B", country: "Brasil", countryCode: "BR", role: "Director", company: "Agency X", bio: "Bio B", order: 2 },
        ],
      }),
    } as any);

    const members = await getHallOfFameMembers();

    expect(members).toHaveLength(2);
    expect(members[0].name).toBe("Member A");
    expect(members[1].name).toBe("Member B");
    expect(members[1].role).toBe("Director");
    expect(members[1].company).toBe("Agency X");
  });
});

// ---------------------------------------------------------------------------
// 2. Payload devuelve docs vacío → fallback al mock
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (Payload docs vacío → fallback)", () => {
  it("retorna miembros del mock cuando Payload devuelve docs vacío", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any);

    const members = await getHallOfFameMembers();

    expect(members).toBeInstanceOf(Array);
    expect(members.length).toBeGreaterThanOrEqual(1);
    const slugs = members.map((m) => m.slug);
    expect(slugs).toContain("mex-fernando-castillo");
  });
});

// ---------------------------------------------------------------------------
// 3. Payload tira error → fallback al mock
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (Payload error → fallback)", () => {
  it("retorna miembros del mock cuando getPayloadClient falla", async () => {
    mockGetPayloadClient.mockRejectedValue(new Error("DB unavailable"));

    const members = await getHallOfFameMembers();

    expect(members).toBeInstanceOf(Array);
    expect(members.length).toBeGreaterThanOrEqual(1);
    const slugs = members.map((m) => m.slug);
    expect(slugs).toContain("mex-fernando-castillo");
  });
});

// ---------------------------------------------------------------------------
// 4. Payload null → fallback al mock
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (Payload null → fallback)", () => {
  it("retorna miembros del mock cuando getPayloadClient devuelve null", async () => {
    mockGetPayloadClient.mockResolvedValue(null);

    const members = await getHallOfFameMembers();

    expect(members).toBeInstanceOf(Array);
    expect(members.length).toBeGreaterThanOrEqual(1);
    expect(members[0]).toHaveProperty("slug");
    expect(members[0]).toHaveProperty("name");
    expect(members[0]).toHaveProperty("country");
  });
});

// ---------------------------------------------------------------------------
// 5. Fallback mock original (sin Payload mockeado)
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (fallback mock)", () => {
  it("devuelve los miembros del mock cuando no hay Payload/DB", async () => {
    const members = await getHallOfFameMembers();
    expect(members).toBeInstanceOf(Array);
    expect(members.length).toBeGreaterThanOrEqual(1);
    expect(members[0]).toHaveProperty("slug");
    expect(members[0]).toHaveProperty("name");
    expect(members[0]).toHaveProperty("country");
    expect(members[0]).toHaveProperty("countryCode");
    expect(members[0]).toHaveProperty("photoUrl");
    expect(members[0]).toHaveProperty("bioText");
    expect(members[0]).toHaveProperty("order");
  });

  it("incluye miembro conocido del mock (Fernando del Castillo)", async () => {
    const members = await getHallOfFameMembers();
    const names = members.map((m) => m.name);
    expect(names).toContain("Fernando del Castillo");
  });
});

// ---------------------------------------------------------------------------
// 6. Ordenamiento por order
// ---------------------------------------------------------------------------
describe("getHallOfFameMembers (ordenamiento)", () => {
  it("retorna miembros ordenados por campo order desde Payload", async () => {
    mockGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          { slug: "first", name: "First", country: "AR", countryCode: "AR", role: "", company: "", bio: "", order: 1 },
          { slug: "second", name: "Second", country: "BR", countryCode: "BR", role: "", company: "", bio: "", order: 2 },
          { slug: "third", name: "Third", country: "MX", countryCode: "MX", role: "", company: "", bio: "", order: 3 },
        ],
      }),
    } as any);

    const members = await getHallOfFameMembers();

    expect(members).toHaveLength(3);
    expect(members[0].order).toBe(1);
    expect(members[1].order).toBe(2);
    expect(members[2].order).toBe(3);
    expect(members[0].name).toBe("First");
    expect(members[2].name).toBe("Third");
  });

  it("retorna miembros del mock ordenados por order", async () => {
    const members = await getHallOfFameMembers();

    // Verificar que están ordenados (el mock tiene order 1, 2, 3, ...)
    for (let i = 1; i < members.length; i++) {
      expect(members[i].order).toBeGreaterThanOrEqual(members[i - 1].order);
    }
  });
});
