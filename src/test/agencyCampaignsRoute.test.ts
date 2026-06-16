/**
 * AGENTESOPE-47 — /api/agency-campaigns route: handler unit tests
 *
 * We test the POST handler logic directly without spinning up a Next.js server.
 * The Payload client and next/headers are mocked so tests are fast and hermetic.
 *
 * Coverage:
 *  - POST 201 with valid authenticated agency user
 *  - POST 400 when required fields are missing
 *  - POST 401 when there is no authenticated agency user
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// vi.hoisted() — declare mutable spies BEFORE vi.mock() hoists them.
// This is the idiomatic Vitest pattern when factories need cross-call spies.
// ---------------------------------------------------------------------------

const { mockCreate, mockAuth } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const mockAuth = vi.fn();
  return { mockCreate, mockAuth };
});

// ---------------------------------------------------------------------------
// Mocks — factories run at hoist time, so references to hoisted vars are safe.
// ---------------------------------------------------------------------------

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn().mockResolvedValue({
    auth: mockAuth,
    create: mockCreate,
  }),
}));

// ---------------------------------------------------------------------------
// Import handler AFTER mocks are registered.
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/agency-campaigns/route";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/agency-campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/agency-campaigns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 401 — unauthenticated / wrong role
  // -------------------------------------------------------------------------

  it("returns 401 when auth resolves with no user", async () => {
    mockAuth.mockResolvedValue({ user: null });

    const res = await POST(
      makeRequest({ campaignName: "Test", company: "Acme", description: "desc" })
    );

    expect(res.status).toBe(401);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(false);
  });

  it("returns 401 when the user role is not agency (e.g. admin)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.com", role: "admin" } });

    const res = await POST(
      makeRequest({ campaignName: "Test", company: "Acme", description: "desc" })
    );

    expect(res.status).toBe(401);
  });

  it("returns 401 when auth() throws (no session cookie)", async () => {
    mockAuth.mockRejectedValue(new Error("no session"));

    const res = await POST(
      makeRequest({ campaignName: "Test", company: "Acme", description: "desc" })
    );

    expect(res.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // 400 — missing required fields
  // -------------------------------------------------------------------------

  it("returns 400 when campaignName is absent", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });

    const res = await POST(makeRequest({ company: "Acme", description: "desc" }));

    expect(res.status).toBe(400);
    const json = (await res.json()) as { ok: boolean; message: string };
    expect(json.ok).toBe(false);
    expect(json.message).toMatch(/required/i);
  });

  it("returns 400 when company is absent", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });

    const res = await POST(makeRequest({ campaignName: "Mi Campaña", description: "desc" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when description is absent", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });

    const res = await POST(makeRequest({ campaignName: "Mi Campaña", company: "Acme" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the request body is malformed JSON", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });

    const req = new Request("http://localhost/api/agency-campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // -------------------------------------------------------------------------
  // 201 — valid submission
  // -------------------------------------------------------------------------

  it("returns 201 with id and status for a valid draft submission", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });
    mockCreate.mockResolvedValue({ id: "doc-abc", status: "draft" });

    const res = await POST(
      makeRequest({
        campaignName: "Mi Campaña",
        company: "Acme",
        description: "Una descripción válida.",
        categories: ["cat-1", "cat-2"],
      })
    );

    expect(res.status).toBe(201);
    const json = (await res.json()) as { ok: boolean; id: string; status: string };
    expect(json.ok).toBe(true);
    expect(json.id).toBe("doc-abc");
    expect(json.status).toBe("draft");
  });

  it("stores submittedBy from the authenticated user id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-42", email: "ag@fip.com", role: "agency" } });
    mockCreate.mockResolvedValue({ id: "doc-xyz", status: "draft" });

    await POST(
      makeRequest({ campaignName: "Campaña X", company: "Brand Y", description: "Descripción." })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ submittedBy: "user-42" }),
      })
    );
  });

  it("forces status to draft when agency sends a privileged status like 'accepted'", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });
    mockCreate.mockResolvedValue({ id: "doc-1", status: "draft" });

    await POST(
      makeRequest({
        campaignName: "Camp",
        company: "Co",
        description: "Desc",
        status: "accepted",
      })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "draft" }),
      })
    );
  });

  it("accepts status 'submitted' when agency explicitly submits", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });
    mockCreate.mockResolvedValue({ id: "doc-2", status: "submitted" });

    await POST(
      makeRequest({
        campaignName: "Camp",
        company: "Co",
        description: "Desc",
        status: "submitted",
      })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "submitted" }),
      })
    );
  });

  it("sets paymentStatus to 'pending' regardless of input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "ag@fip.com", role: "agency" } });
    mockCreate.mockResolvedValue({ id: "doc-3", status: "draft" });

    await POST(
      makeRequest({ campaignName: "Camp", company: "Co", description: "Desc" })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: "pending" }),
      })
    );
  });
});
