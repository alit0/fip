import { describe, it, expect } from "vitest";
import { isExternal } from "@/components/shared/Cta";

// `isExternal` decide si un enlace se renderiza como <a> normal (externo/descarga)
// o como <Link> de Next (navegación interna del SPA).
describe("isExternal", () => {
  it("considera externas las URLs http(s)", () => {
    expect(isExternal("https://www.instagram.com/fipfestival")).toBe(true);
    expect(isExternal("http://ejemplo.com")).toBe(true);
  });

  it("considera externas las descargas (/descargas/...)", () => {
    expect(isExternal("/descargas/reglamento.pdf")).toBe(true);
  });

  it("considera internas las rutas del sitio (usan next/link)", () => {
    expect(isExternal("/premios")).toBe(false);
    expect(isExternal("/categorias#rubro-1")).toBe(false);
  });
});
