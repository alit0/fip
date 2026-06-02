import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

// Páginas estáticas SÍNCRONAS (placeholders: la función devuelve JSX directo)
import Inscripcion from "@/app/[locale]/(public)/inscripcion/page";
import Fechas from "@/app/[locale]/(public)/fechas-de-cierre/page";
import Tarifario from "@/app/[locale]/(public)/tarifario/page";
import Premios from "@/app/[locale]/(public)/premios/page";
import Hall from "@/app/[locale]/(public)/hall-de-la-fama/page";
import Contacto from "@/app/[locale]/(public)/contacto/page";
import Consejos from "@/app/[locale]/(public)/20-consejos/page";

// Páginas ASÍNCRONAS (leen la capa de contenido con await)
import Home from "@/app/[locale]/(public)/page";
import Reglamento from "@/app/[locale]/(public)/reglamento/page";
import Categorias from "@/app/[locale]/(public)/categorias/page";

// Páginas dinámicas ASÍNCRONAS (reciben `params` como Promise)
import JuradosYear from "@/app/[locale]/(public)/jurados/[year]/page";
import GanadoresYear from "@/app/[locale]/(public)/ganadores/[year]/page";
import RankingCountry from "@/app/[locale]/(public)/ranking/[country]/page";

const staticPages: [string, () => React.ReactNode][] = [
  ["Inscripción", Inscripcion],
  ["Fechas de cierre", Fechas],
  ["Tarifario", Tarifario],
  ["Premios", Premios],
  ["Hall de la Fama", Hall],
  ["Contacto", Contacto],
  ["20 Consejos", Consejos],
];

describe("páginas públicas estáticas (placeholders)", () => {
  it.each(staticPages)("«%s» renderiza sin error y con contenido", (_name, Page) => {
    const { container } = render(<Page />);
    expect(container).not.toBeEmptyDOMElement();
  });
});

describe("páginas con datos (async server components)", () => {
  it("«Home» renderiza", async () => {
    const { container } = render(await Home());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Reglamento» renderiza", async () => {
    const { container } = render(await Reglamento());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Categorías» renderiza", async () => {
    const { container } = render(await Categorias());
    expect(container).not.toBeEmptyDOMElement();
  });
});

describe("páginas públicas dinámicas (con un parámetro válido)", () => {
  it("«Jurados [year]» renderiza para 2026", async () => {
    const ui = await JuradosYear({ params: Promise.resolve({ year: "2026" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Ganadores [year]» renderiza para 2025", async () => {
    const ui = await GanadoresYear({ params: Promise.resolve({ year: "2025" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Ranking [country]» renderiza para colombia", async () => {
    const ui = await RankingCountry({ params: Promise.resolve({ country: "colombia" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });
});
