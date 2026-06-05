import type { Metadata } from "next";
import { ArrowUp } from "lucide-react";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import CountryFlag from "@/components/shared/CountryFlag";
import { getHallDeLaFama } from "@/lib/content";

const description =
  "Hall de la Fama del FIP Festival: tributo a las figuras y leyendas que marcaron la historia del marketing, las promociones y los eventos de la región.";

export const metadata: Metadata = {
  title: "Hall de la Fama",
  description,
  alternates: { canonical: "/hall-de-la-fama" },
  openGraph: {
    title: "Hall de la Fama · FIP Festival",
    description,
    url: "/hall-de-la-fama",
    type: "article",
  },
};

export default async function HallDeLaFamaPage() {
  const { title, institutional, members } = await getHallDeLaFama();

  return (
    <>
      <Section bg="base" id="hall-top" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Hall de la Fama" }]} />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">{title}</h1>
      </Section>

      {/* Bloque institucional */}
      <Section bg="mid" className="!pt-0">
        <div className="mx-auto max-w-3xl space-y-8">
          {institutional.map((block) => (
            <div key={block.title}>
              <h2 className="font-title text-xl font-black uppercase tracking-wide text-fip-gold">
                {block.title}
              </h2>
              <div className="mt-3 space-y-3 text-fip-white/85">
                {block.body.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Grilla de accesos */}
      <Section bg="base">
        <h2 className="mb-8 text-center font-title text-2xl font-black uppercase tracking-wide text-fip-gold">
          Miembros
        </h2>
        <ul className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.slug}>
              <a
                href={`#${member.slug}`}
                className="flex h-full flex-col rounded-lg bg-fip-white/5 px-4 py-3 ring-1 ring-fip-white/10 transition hover:bg-fip-white/10 hover:ring-fip-gold/40"
              >
                <span className="font-title font-bold text-fip-white">{member.name}</span>
                {(member.role || member.company) && (
                  <span className="mt-1 line-clamp-1 text-xs text-fip-white/60">
                    {member.role || member.company}
                  </span>
                )}
                {member.country && (
                  <CountryFlag
                    countryCode={member.countryCode}
                    countryName={member.country}
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
          {members.map((member) => (
            <article
              key={member.slug}
              id={member.slug}
              className="grid scroll-mt-24 gap-6 md:grid-cols-[200px_1fr]"
            >
              <div className="mx-auto w-full max-w-[200px] space-y-3">
                <ImagePlaceholder label={`Foto ${member.name}`} className="aspect-[3/4] w-full" />
                {member.logoTodo && (
                  <ImagePlaceholder label="Logo" className="aspect-[3/2] w-full" />
                )}
              </div>
              <div>
                <h3 className="font-title text-2xl font-black">{member.name}</h3>
                {member.role && <p className="mt-1 font-title text-fip-gold">{member.role}</p>}
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fip-white/70">
                  {member.country && (
                    <CountryFlag countryCode={member.countryCode} countryName={member.country} />
                  )}
                  {member.company && <span>{member.company}</span>}
                </p>

                {member.bioText ? (
                  <div className="mt-4 space-y-3 text-fip-white/85">
                    {member.bioText.split(/\n\n+/).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : member.bioImageTodo ? (
                  <ImagePlaceholder
                    label={`Bio (imagen): ${member.bioImageTodo}`}
                    className="mt-4 aspect-[16/9] w-full"
                  />
                ) : null}

                <a
                  href="#hall-top"
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
