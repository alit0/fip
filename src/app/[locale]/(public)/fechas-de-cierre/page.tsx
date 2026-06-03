import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import DiscountTable from "@/components/fechas/DiscountTable";
import ClosingTable from "@/components/fechas/ClosingTable";
import { getFechasCierre } from "@/lib/content";

const description =
  "Fechas de cierre por región y descuentos de inscripción del FIP Festival 2026, más el cronograma de juzgamiento, finalistas y premiación.";

export const metadata: Metadata = {
  title: "Fechas de cierre",
  description,
  alternates: { canonical: "/fechas-de-cierre" },
  openGraph: {
    title: "Fechas de cierre · FIP Festival",
    description,
    url: "/fechas-de-cierre",
    type: "article",
  },
};

export default async function FechasDeCierrePage() {
  const { title, intro, discounts, closings } = await getFechasCierre();

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Fechas de cierre" }]}
        />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-fip-white/80">
          {intro}
        </p>
      </Section>

      <Section bg="base" className="!pt-0">
        <h2 className="mb-6 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
          {discounts.heading}
        </h2>
        <DiscountTable rows={discounts.rows} />
      </Section>

      <Section bg="mid">
        <h2 className="mb-6 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
          {closings.heading}
        </h2>
        <div className="space-y-6">
          <ClosingTable rows={closings.regions} labelHeader="Región" />
          <ClosingTable rows={closings.milestones} labelHeader="Etapa" />
        </div>
        <p className="mx-auto mt-6 max-w-5xl text-sm text-fip-white/60">
          {closings.note}
        </p>
      </Section>

      <BackToTop />
    </>
  );
}
