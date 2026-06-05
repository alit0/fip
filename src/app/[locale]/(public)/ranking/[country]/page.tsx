import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import CountryFlag from "@/components/shared/CountryFlag";
import { RANKING_COUNTRIES } from "@/lib/navigation";
import { getRanking } from "@/lib/content";

export function generateStaticParams() {
  return RANKING_COUNTRIES.map(({ slug }) => ({ country: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const data = await getRanking(country);
  const label = data?.label ?? country;
  const description = `Ranking histórico de agencias del FIP Festival en ${label} (${data?.period ?? "2017 - 2024"}).`;
  return {
    title: `Ranking ${label}`,
    description,
    alternates: { canonical: `/ranking/${country}` },
    openGraph: {
      title: `Ranking ${label} · FIP Festival`,
      description,
      url: `/ranking/${country}`,
      type: "article",
    },
  };
}

const cols = [
  { key: "granPrix", label: "Gran Prix" },
  { key: "oro", label: "Oro" },
  { key: "plata", label: "Plata" },
  { key: "bronce", label: "Bronce" },
  { key: "total", label: "Total" },
] as const;

export default async function RankingCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const data = await getRanking(country);
  if (!data) notFound();

  return (
    <>
      {/* Hero banner del país */}
      <Section bg="base" id="ranking-top" className="!pb-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Ranking" },
            { label: `Ranking ${data.label}` },
          ]}
        />
        <div className="relative mt-6 overflow-hidden rounded-xl">
          <ImagePlaceholder
            label={`Banner ${data.label} (TODO)`}
            rounded="rounded-xl"
            className="aspect-[16/5] w-full"
          />
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-fip-gold/50 bg-fip-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-fip-gold">
            {data.period}
          </span>
          <h1 className="flex flex-wrap items-center justify-center gap-3 font-title text-4xl font-black md:text-5xl">
            Ranking
            <CountryFlag countryCode={data.countryCode} countryName={data.label} />
          </h1>
        </div>
      </Section>

      {/* Tabla histórica */}
      <Section bg="base" className="!pt-0">
        <div className="mx-auto max-w-4xl overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-fip-purple-500 uppercase tracking-wide text-fip-white">
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Agencia</th>
                {cols.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-center">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-fip-purple-900">
              {data.rows.map((row, i) => (
                <tr key={row.position} className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}>
                  <td className="px-3 py-2.5 font-title font-black">{row.position}</td>
                  <td className="px-3 py-2.5 font-bold">{row.agency}</td>
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2.5 text-center ${
                        c.key === "total" ? "font-title font-black" : ""
                      }`}
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <BackToTop />
    </>
  );
}
