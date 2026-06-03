import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import DownloadButton from "@/components/shared/DownloadButton";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import { getPremios } from "@/lib/content";

const description =
  "Premios y réplicas del FIP Festival: catálogo de trofeos con precios, tarifario de envío por peso, medios de pago y condiciones de envío.";

export const metadata: Metadata = {
  title: "Premios / Réplicas",
  description,
  alternates: { canonical: "/premios" },
  openGraph: {
    title: "Premios / Réplicas · FIP Festival",
    description,
    url: "/premios",
    type: "article",
  },
};

export default async function PremiosPage() {
  const { title, intro, orderEmail, priceNotice, trophies, shipping, sections, downloads } =
    await getPremios();

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Premios / Réplicas" }]} />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-center text-fip-white/85">
          {intro}{" "}
          <a href={`mailto:${orderEmail}`} className="font-bold text-fip-gold hover:underline">
            {orderEmail}
          </a>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <DownloadButton label={downloads.es.label} href={downloads.es.href} lang="ES" />
          <DownloadButton label={downloads.pt.label} href={downloads.pt.href} lang="PT" />
        </div>
      </Section>

      {/* Catálogo de trofeos */}
      <Section bg="base" className="!pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trophies.map((trophy) => (
            <article
              key={trophy.name}
              className="flex flex-col overflow-hidden rounded-lg bg-fip-white/5 ring-1 ring-fip-white/10"
            >
              <ImagePlaceholder label={trophy.imageTodo} rounded="" className="aspect-[4/3]" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-title text-lg font-black">{trophy.name}</h2>
                  <span className="whitespace-nowrap font-title text-xl font-black text-fip-gold">
                    {trophy.price}
                  </span>
                </div>
                <p className="mt-3 text-sm text-fip-white/80">{trophy.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl rounded-lg border border-fip-gold/40 bg-fip-gold/10 px-5 py-4 text-center text-sm text-fip-white/90">
          ⚠️ {priceNotice}
        </p>
      </Section>

      {/* Tarifario de envío */}
      <Section bg="mid">
        <h2 className="mb-2 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
          {shipping.heading}
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-fip-white/70">
          {shipping.note}
        </p>
        <div className="mx-auto max-w-2xl overflow-x-auto rounded-lg">
          <table className="w-full text-left text-sm">
            <tbody className="text-fip-purple-900">
              {shipping.rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}>
                  <td className="px-4 py-3 font-bold">{row.label}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-title text-lg font-black">
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Bloques de texto (medios de pago, condiciones de envío) */}
      {sections.map((block, i) => (
        <Section key={block.heading} bg={i % 2 === 0 ? "base" : "mid"}>
          <h2 className="mb-6 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
            {block.heading}
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {block.items.map((item) => (
              <div key={item.title}>
                <h3 className="font-title text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-fip-white/85">{item.body}</p>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <BackToTop />
    </>
  );
}
