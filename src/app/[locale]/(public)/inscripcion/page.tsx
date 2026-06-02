import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import StepSection from "@/components/inscripcion/StepSection";
import { getInscripcion } from "@/lib/content";

const description =
  "Cómo presentar tus campañas en el FIP Festival: los 4 pasos (inscripción, presentación, subir campañas y enviar láminas), condiciones generales y guía de contenido.";

export const metadata: Metadata = {
  title: "Inscripción",
  description,
  alternates: { canonical: "/inscripcion" },
  openGraph: {
    title: "Inscripción · FIP Festival",
    description,
    url: "/inscripcion",
    type: "article",
  },
};

export default async function InscripcionPage() {
  const data = await getInscripcion();

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Inscripción" }]} />
        <h1 className="mt-6 font-title text-4xl font-black md:text-5xl">{data.title}</h1>
        <p className="mt-3 text-lg uppercase tracking-wide text-fip-white/80">
          {data.subtitle}
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {data.index.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-block rounded-full border border-fip-white/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-fip-white/85 transition hover:border-fip-gold hover:text-fip-gold"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section bg="base">
        <div className="space-y-16">
          {data.steps.map((step) => (
            <StepSection key={step.id} step={step} />
          ))}
        </div>
      </Section>

      <Section bg="mid" id="condiciones" className="scroll-mt-28">
        <h2 className="text-center font-title text-2xl font-black md:text-3xl">
          {data.condiciones.title}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-fip-white/85">
          {data.condiciones.body}
        </p>
      </Section>

      <Section bg="base" id={data.contenido.id} className="scroll-mt-28">
        <h2 className="text-center font-title text-2xl font-black md:text-3xl">
          {data.contenido.title}
        </h2>
        <h3 className="mx-auto mt-3 max-w-3xl text-center font-title text-fip-gold">
          {data.contenido.question}
        </h3>
        <ol className="mx-auto mt-8 max-w-3xl space-y-6">
          {data.contenido.aspects.map((aspect) => (
            <li key={aspect.number}>
              <h4 className="font-title text-lg font-bold">
                <span className="text-fip-gold">{aspect.number}.</span>{" "}
                {aspect.title}
              </h4>
              <div className="mt-2 space-y-2 text-fip-white/85">
                {aspect.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <BackToTop />
    </>
  );
}
