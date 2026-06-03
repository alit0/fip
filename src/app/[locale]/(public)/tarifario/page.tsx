import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import DownloadButton from "@/components/shared/DownloadButton";
import SponsorsGrid from "@/components/home/SponsorsGrid";
import { getTarifario, getSponsors } from "@/lib/content";

const description =
  "Tarifario 2026 del FIP Festival: aranceles de inscripción, descuentos por cantidad, formas de pago (Argentina y exterior), envío de factura y más.";

export const metadata: Metadata = {
  title: "Tarifario",
  description,
  alternates: { canonical: "/tarifario" },
  openGraph: {
    title: "Tarifario · FIP Festival",
    description,
    url: "/tarifario",
    type: "article",
  },
};

export default async function TarifarioPage() {
  const [data, sponsors] = await Promise.all([getTarifario(), getSponsors()]);
  const { title, notice, baseFees, quantityDiscounts, otherFees, feesNote, downloads, sections } =
    data;

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Tarifario" }]} />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl rounded-lg border border-fip-gold/40 bg-fip-gold/10 px-5 py-4 text-center text-sm text-fip-white/90">
          ⚠️ {notice}
        </p>
      </Section>

      {/* Aranceles */}
      <Section bg="base" className="!pt-0">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Tarifas base */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-center text-sm">
              <thead className="bg-fip-purple-500 uppercase tracking-wide text-fip-white">
                <tr>
                  {baseFees.items.map((item) => (
                    <th key={item.label} className="px-4 py-3">
                      {item.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-fip-white text-fip-purple-900">
                <tr>
                  {baseFees.items.map((item) => (
                    <td key={item.label} className="px-4 py-5 font-title text-xl font-black">
                      {item.price}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Descuentos por cantidad */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {quantityDiscounts.map((d) => (
              <li
                key={d}
                className="rounded-lg bg-fip-white px-4 py-3 text-center font-bold text-fip-purple-900"
              >
                {d}
              </li>
            ))}
          </ul>

          {/* Otras tarifas */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-left text-sm">
              <tbody className="text-fip-purple-900">
                {otherFees.map((fee, i) => (
                  <tr key={fee.label} className={i % 2 ? "bg-fip-white/90" : "bg-fip-white"}>
                    <td className="px-4 py-3">
                      <span className="font-bold">{fee.label}</span>
                      {fee.desc && (
                        <span className="block text-fip-purple-900/70">{fee.desc}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-title text-lg font-black">
                      {fee.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-fip-white/60">{feesNote}</p>
        </div>
      </Section>

      {/* Auspiciantes (reusa el componente del Home) */}
      <SponsorsGrid heading="Auspician" sponsors={sponsors} />

      {/* Descargas */}
      <Section bg="base" className="!pt-0">
        <div className="flex flex-wrap justify-center gap-4">
          <DownloadButton label={downloads.es.label} href={downloads.es.href} lang="ES" />
          <DownloadButton label={downloads.pt.label} href={downloads.pt.href} lang="PT" />
        </div>
      </Section>

      {/* Bloques de texto (pagos, factura, ganadores) */}
      {sections.map((block, i) => (
        <Section key={block.heading} bg={i % 2 === 0 ? "mid" : "base"}>
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
