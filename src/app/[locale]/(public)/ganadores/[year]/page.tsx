import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import CountryFlag from "@/components/shared/CountryFlag";
import { GANADOR_YEARS } from "@/lib/navigation";
import { getGanadores } from "@/lib/content";

export function generateStaticParams() {
  return GANADOR_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const description = `Campeones del FIP ${year}: grandes premios, reconocimientos y agencias del año del FIP Festival.`;
  return {
    title: `Campeones del FIP ${year}`,
    description,
    alternates: { canonical: `/ganadores/${year}` },
    openGraph: {
      title: `Campeones del FIP ${year} · FIP Festival`,
      description,
      url: `/ganadores/${year}`,
      type: "article",
    },
  };
}

function NivelPill({ nivel }: { nivel: string }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-full border border-fip-gold/50 bg-fip-gold/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-fip-gold">
      {nivel}
    </span>
  );
}

export default async function GanadoresYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  if (!GANADOR_YEARS.includes(Number(year))) notFound();

  const data = await getGanadores(year);
  if (!data) notFound();

  const { grandes, rubros, pdfUrl, completeness } = data;

  return (
    <>
      <Section bg="base" id="ganadores-top" className="!pb-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Ganadores" },
            { label: `Ganadores ${year}` },
          ]}
        />
        <p className="mt-6 text-center text-sm uppercase tracking-widest text-fip-gold">
          Campeones del FIP
        </p>
        <h1 className="mt-2 text-center font-title text-4xl font-black md:text-5xl">
          Ganadores {year}
        </h1>

        {pdfUrl ? (
          <div className="mt-8 flex justify-center">
            <a
              href={pdfUrl}
              className="inline-flex items-center gap-2 rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 transition hover:brightness-110"
            >
              <Download size={16} strokeWidth={2} />
              Descargar Informe Completo (PDF)
            </a>
          </div>
        ) : completeness !== "completo" ? (
          <p className="mt-8 text-center text-sm text-fip-white/50">
            {/* TODO: link real del informe PDF del vivo pendiente */}
            Informe completo en PDF — link pendiente.
          </p>
        ) : null}
      </Section>

      {/* Grandes Premios & Reconocimientos */}
      {grandes.length > 0 && (
        <Section bg="base" className="!pt-0">
          <h2 className="mb-6 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
            Grandes Premios & Reconocimientos
          </h2>
          <div className="mx-auto max-w-4xl overflow-x-auto rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-fip-purple-500 uppercase tracking-wide text-fip-white">
                <tr>
                  <th className="px-4 py-3">Premio / Categoría</th>
                  <th className="px-4 py-3">Ganador / Agencia</th>
                  <th className="px-4 py-3">País</th>
                </tr>
              </thead>
              <tbody className="text-fip-purple-900">
                {grandes.map((g, i) => (
                  <tr
                    key={`${g.premio}-${g.ganador}-${i}`}
                    className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}
                  >
                    <td className="px-4 py-2.5 font-bold">{g.premio}</td>
                    <td className="px-4 py-2.5">{g.ganador}</td>
                    <td className="px-4 py-2.5">
                      <CountryFlag countryCode={g.countryCode} countryName={g.pais} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Categorías con Gran Prix (años completos) */}
      {rubros.length > 0 && (
        <Section bg="mid">
          <h2 className="mb-8 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
            Categorías con Gran Prix
          </h2>
          <div className="mx-auto max-w-5xl space-y-10">
            {rubros.map((rubro) => (
              <div key={rubro.rubro}>
                <h3 className="font-title text-xl font-black text-fip-white">
                  Rubro {rubro.rubro}
                </h3>
                <div className="mt-4 space-y-6">
                  {rubro.categorias.map((cat, ci) => (
                    <div key={cat.codigo || cat.nombre || ci}>
                      {(cat.codigo || cat.nombre) && (
                        <h4 className="mb-2 font-bold text-fip-gold">
                          {[cat.codigo, cat.nombre].filter(Boolean).join(" · ")}
                        </h4>
                      )}
                      <div className="overflow-x-auto rounded-lg">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-fip-purple-900/80 uppercase tracking-wide text-fip-white/80">
                            <tr>
                              <th className="px-3 py-2">Premio</th>
                              <th className="px-3 py-2">Campaña</th>
                              <th className="px-3 py-2">Marca</th>
                              <th className="px-3 py-2">Agencia</th>
                              <th className="px-3 py-2">País</th>
                            </tr>
                          </thead>
                          <tbody className="bg-fip-white text-fip-purple-900">
                            {cat.rows.map((row, ri) => (
                              <tr
                                key={ri}
                                className={ri % 2 ? "bg-fip-white/90" : "bg-fip-white"}
                              >
                                <td className="px-3 py-2.5">
                                  <NivelPill nivel={row.nivel} />
                                </td>
                                <td className="px-3 py-2.5 font-bold">{row.campania}</td>
                                <td className="px-3 py-2.5">{row.marca}</td>
                                <td className="px-3 py-2.5">{row.agencia}</td>
                                <td className="px-3 py-2.5">
                                  <CountryFlag countryCode={row.countryCode} countryName={row.pais} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <BackToTop />
    </>
  );
}
