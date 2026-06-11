import { describe, it, expect } from "vitest";
import { authGate } from "@/lib/auth/gate";

describe("authGate (middleware routing gate)", () => {
  it("does not gate public pages", () => {
    expect(authGate("/", false)).toBeNull();
    expect(authGate("/categorias", false)).toBeNull();
    expect(authGate("/tarifario", false)).toBeNull();
  });

  it("keeps the public /jurados listing open (no collision with the private area)", () => {
    expect(authGate("/jurados/2026", false)).toBeNull();
    expect(authGate("/pt/jurados/2026", false)).toBeNull();
  });

  it("treats the login roots as public", () => {
    expect(authGate("/acceso/agencias", false)).toBeNull();
    expect(authGate("/acceso/jurados", false)).toBeNull();
    expect(authGate("/pt/acceso/agencias", false)).toBeNull();
  });

  it("redirects protected sub-paths without a session to the area login", () => {
    expect(authGate("/acceso/agencias/panel", false)).toEqual({
      redirect: "/acceso/agencias",
    });
    expect(authGate("/acceso/jurados/scoring", false)).toEqual({
      redirect: "/acceso/jurados",
    });
  });

  it("preserves the /pt locale prefix on redirect", () => {
    expect(authGate("/pt/acceso/agencias/panel", false)).toEqual({
      redirect: "/pt/acceso/agencias",
    });
    expect(authGate("/pt/acceso/jurados/scoring", false)).toEqual({
      redirect: "/pt/acceso/jurados",
    });
  });

  it("allows protected paths through when a session cookie is present", () => {
    expect(authGate("/acceso/agencias/panel", true)).toBeNull();
    expect(authGate("/pt/acceso/jurados/scoring", true)).toBeNull();
  });

  it("ignores unknown areas under /acceso", () => {
    expect(authGate("/acceso/otracosa/x", false)).toBeNull();
  });
});
