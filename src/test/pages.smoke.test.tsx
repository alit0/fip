import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

// Páginas estáticas SÍNCRONAS (placeholders: la función devuelve JSX directo)
import Consejos from "@/app/[locale]/(public)/20-consejos/page";

// Páginas ASÍNCRONAS (leen la capa de contenido con await)
import Home from "@/app/[locale]/(public)/page";
import Reglamento from "@/app/[locale]/(public)/reglamento/page";
import Categorias from "@/app/[locale]/(public)/categorias/page";
import Inscripcion from "@/app/[locale]/(public)/inscripcion/page";
import Fechas from "@/app/[locale]/(public)/fechas-de-cierre/page";
import Tarifario from "@/app/[locale]/(public)/tarifario/page";
import Premios from "@/app/[locale]/(public)/premios/page";
import Hall from "@/app/[locale]/(public)/hall-de-la-fama/page";
import Contacto from "@/app/[locale]/(public)/contacto/page";

// Páginas dinámicas ASÍNCRONAS (reciben `params` como Promise)
import JuradosYear from "@/app/[locale]/(public)/jurados/[year]/page";
import GanadoresYear from "@/app/[locale]/(public)/ganadores/[year]/page";
import RankingCountry from "@/app/[locale]/(public)/ranking/[country]/page";

const staticPages: [string, () => React.ReactNode][] = [
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

  it("«Home» muestra el subtítulo verbatim del vivo (LA NOCHE DE LOS CAMPEONES)", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("LA NOCHE DE LOS CAMPEONES");
  });

  it("«Reglamento» renderiza", async () => {
    const { container } = render(await Reglamento());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Reglamento» muestra el cuerpo verbatim de un artículo (Art. C)", async () => {
    const { container } = render(await Reglamento());
    expect(container.textContent).toContain("videos de hasta 7 megas");
  });

  it("«Categorías» renderiza", async () => {
    const { container } = render(await Categorias());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Inscripción» renderiza", async () => {
    const { container } = render(await Inscripcion());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Fechas de cierre» renderiza", async () => {
    const { container } = render(await Fechas());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Tarifario» renderiza", async () => {
    const { container } = render(await Tarifario());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Premios» renderiza", async () => {
    const { container } = render(await Premios());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Premios» muestra un precio clave (Agencia del Año: 550)", async () => {
    const { container } = render(await Premios());
    expect(container.textContent).toContain("550");
  });

  it("«Hall de la Fama» renderiza", async () => {
    const { container } = render(await Hall());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Hall de la Fama» muestra un miembro conocido (César González)", async () => {
    const { container } = render(await Hall());
    expect(container.textContent).toContain("César González");
  });

  it("«Contacto» renderiza", async () => {
    const { container } = render(await Contacto());
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Contacto» muestra un email de contacto y el formulario", async () => {
    const { container } = render(await Contacto());
    expect(container.textContent).toContain("jorge@fipfestival.com.ar");
    expect(container.querySelector("form")).not.toBeNull();
  });
});

describe("páginas públicas dinámicas (con un parámetro válido)", () => {
  it("«Jurados [year]» renderiza para 2026", async () => {
    const ui = await JuradosYear({ params: Promise.resolve({ year: "2026" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Jurados 2026» muestra un jurado con su país (Agustin Herrero · Chile)", async () => {
    const ui = await JuradosYear({ params: Promise.resolve({ year: "2026" }) });
    const { container } = render(ui);
    expect(container.textContent).toContain("Agustin Herrero");
    expect(container.textContent).toContain("Chile");
    expect(container.querySelector('svg[aria-label="Bandera de Chile"]')).not.toBeNull();
  });

  it("«Ganadores [year]» renderiza para 2025", async () => {
    const ui = await GanadoresYear({ params: Promise.resolve({ year: "2025" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Ganadores 2025» (completo) muestra la grilla de Categorías con Gran Prix", async () => {
    const ui = await GanadoresYear({ params: Promise.resolve({ year: "2025" }) });
    const { container } = render(ui);
    expect(container.textContent).toContain("Categorías con Gran Prix");
    expect(container.textContent).toContain("Heineken Power Music Station");
  });

  it("«Ganadores 2024» (solo-PDF) muestra el botón de descarga del informe", async () => {
    const ui = await GanadoresYear({ params: Promise.resolve({ year: "2024" }) });
    const { container } = render(ui);
    expect(
      container.querySelector('a[href="/descargas/informe-ganadores-fip2024.pdf"]'),
    ).not.toBeNull();
  });

  it("«Ranking [country]» renderiza para colombia", async () => {
    const ui = await RankingCountry({ params: Promise.resolve({ country: "colombia" }) });
    const { container } = render(ui);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("«Ranking colombia» muestra una agencia del ranking (Publictv)", async () => {
    const ui = await RankingCountry({ params: Promise.resolve({ country: "colombia" }) });
    const { container } = render(ui);
    expect(container.textContent).toContain("Publictv");
  });
});
