import { describe, it, expect } from "vitest";
import { agencyPanelPath, isAgencyLoginResponse, validatePasswordReset } from "@/lib/auth/agencyAccess";

describe("agency access helpers", () => {
  it("builds the agency panel path preserving the pt locale", () => {
    expect(agencyPanelPath("/acceso/agencias")).toBe("/acceso/agencias/panel");
    expect(agencyPanelPath("/pt/acceso/agencias")).toBe("/pt/acceso/agencias/panel");
  });

  it("validates password reset input", () => {
    expect(validatePasswordReset("short", "short")).toBe("La contraseña debe tener al menos 8 caracteres.");
    expect(validatePasswordReset("long-enough", "different")).toBe("Las contraseñas no coinciden.");
    expect(validatePasswordReset("long-enough", "long-enough")).toBeNull();
  });

  it("accepts only agency login responses", () => {
    expect(isAgencyLoginResponse({ user: { role: "agency" } })).toBe(true);
    expect(isAgencyLoginResponse({ user: { role: "juror" } })).toBe(false);
    expect(isAgencyLoginResponse(null)).toBe(false);
  });
});
