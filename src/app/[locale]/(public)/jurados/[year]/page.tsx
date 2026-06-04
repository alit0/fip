import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUp } from "lucide-react";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import CountryFlag from "@/components/shared/CountryFlag";
import { JURADO_YEARS } from "@/lib/navigation";
import { getJurados } from "@/lib/content";

export function generateStaticParams() {
  return JURADO_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const description = `Jurado internacional del FIP Festival ${year}: perfiles, cargo, país y trayectoria de cada integrante.`;
  return {
    title: `Jurados ${year}`,
    description,
    alternates: { canonical: `/jurados/${year}` },
    openGraph: {
      title: `Jurados ${year} · FIP Festival`,
      description,
      url: `/jurados/${year}`,
      type: "article",
    },
  };
}

export default async function JuradosYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  if (!JURADO_YEARS.includes(Number(year))) notFound();

  const jurados = await getJurados(year);

  return (
    <>
      <Section bg="base" id="jurados-top" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: `Jurados ${year}` }]} />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">
          Jurados {year}
        </h1>
        <p className="mt-3 text-center text-sm uppercase tracking-widest text-fip-white/60">
          {jurados.length} {jurados.length === 1 ? "jurado" : "jurados"}
        </p>

        {/* Grilla de accesos: nombre + cargo + país, lleva a la ficha */}
        <ul className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jurados.map((juror) => (
            <li key={juror.slug}>
              <a
                href={`#${juror.slug}`}
                className="flex h-full flex-col rounded-lg bg-fip-white/5 px-4 py-3 ring-1 ring-fip-white/10 transition hover:bg-fip-white/10 hover:ring-fip-gold/40"
              >
                <span className="font-title font-bold text-fip-white">{juror.name}</span>
                {juror.role && (
                  <span className="mt-1 line-clamp-1 text-xs text-fip-white/60">{juror.role}</span>
                )}
                {juror.country && (
                  <CountryFlag
                    countryCode={juror.countryCode}
                    countryName={juror.country}
                    className="mt-2 text-xs text-fip-white/80"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* Fichas completas */}
      <Section bg="base" className="!pt-0">
        <div className="mx-auto max-w-4xl space-y-12">
          {jurados.map((juror) => (
            <article
              key={juror.slug}
              id={juror.slug}
              className="grid scroll-mt-24 gap-6 md:grid-cols-[200px_1fr]"
            >
              <ImagePlaceholder
                label={`Foto ${juror.name}`}
                className="mx-auto aspect-[3/4] w-full max-w-[200px]"
              />
              <div>
                <h2 className="font-title text-2xl font-black">{juror.name}</h2>
                {juror.role && (
                  <p className="mt-1 font-title text-fip-gold">{juror.role}</p>
                )}
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fip-white/70">
                  {juror.country && (
                    <CountryFlag countryCode={juror.countryCode} countryName={juror.country} />
                  )}
                  {juror.agency && <span>Agencia: {juror.agency}</span>}
                </p>
                {juror.bio && <p className="mt-4 text-fip-white/85">{juror.bio}</p>}
                <a
                  href="#jurados-top"
                  className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-fip-gold hover:underline"
                >
                  <ArrowUp size={14} strokeWidth={2.5} />
                  Volver arriba
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <BackToTop />
    </>
  );
}
