import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import DownloadButton from "@/components/shared/DownloadButton";
import BackToTop from "@/components/shared/BackToTop";
import RubroCard from "@/components/categorias/RubroCard";
import RubroDetail from "@/components/categorias/RubroDetail";
import { getRubros, getCategoriesByRubro, getCategoriasPage } from "@/lib/content";

const description =
  "Los 23 segmentos del FIP Festival 2026 y sus categorías, con sus premios (oro, cristal y platino). Descargable en español y portugués.";

export const metadata: Metadata = {
  title: "Categorías 2026",
  description,
  alternates: { canonical: "/categorias" },
  openGraph: {
    title: "Categorías 2026 · FIP Festival",
    description,
    url: "/categorias",
    type: "article",
  },
};

export default async function CategoriasPage() {
  const [page, rubros, categoriesByRubro] = await Promise.all([
    getCategoriasPage(),
    getRubros(),
    getCategoriesByRubro(),
  ]);
  const { subtitle, downloads, ventajas } = page;

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categorías" }]} />
        <h1 className="mt-6 font-title text-4xl font-black md:text-5xl">
          Categorías <span className="text-fip-gold">2026</span>
        </h1>
        <p className="mt-3 text-lg text-fip-white/80">{subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <DownloadButton label={downloads.es.label} href={downloads.es.href} lang="ES" />
          <DownloadButton label={downloads.pt.label} href={downloads.pt.href} lang="PT" />
        </div>
      </Section>

      {/* Top index grid → anchors */}
      <Section bg="mid">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rubros.map((rubro) => (
            <li key={rubro.number}>
              <RubroCard rubro={rubro} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Ventajas a considerar */}
      <Section bg="base">
        <h2 className="mb-6 font-title text-xl font-bold uppercase tracking-wide text-fip-gold">
          Ventajas a considerar
        </h2>
        <ul className="space-y-4">
          {ventajas.map((v) => (
            <li key={v.title}>
              <h3 className="font-title text-base font-bold">{v.title}</h3>
              <p className="mt-1 text-sm text-fip-white/70">
                {v.body ?? (
                  <span className="italic text-fip-white/35">
                    TODO: texto (verbatim desde el sitio / categorias.pdf).
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-fip-white/60">
          Ver{" "}
          <Link href="/tarifario" className="text-fip-gold underline-offset-2 hover:underline">
            Tarifario
          </Link>{" "}
          y{" "}
          <Link href="/20-consejos" className="text-fip-gold underline-offset-2 hover:underline">
            20 Consejos del FIP
          </Link>
          .
        </p>
      </Section>

      {/* Rubro detail sections */}
      <Section bg="base" className="!pt-0">
        <div className="space-y-8">
          {rubros.map((rubro) => (
            <RubroDetail
              key={rubro.number}
              rubro={rubro}
              categories={categoriesByRubro.get(rubro.number) ?? []}
            />
          ))}
        </div>
      </Section>

      <BackToTop />
    </>
  );
}
