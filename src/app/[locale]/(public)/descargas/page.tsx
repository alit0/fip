import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import DownloadButton from "@/components/shared/DownloadButton";
import BackToTop from "@/components/shared/BackToTop";
import { getDownloadFiles } from "@/lib/content";
import type { Locale } from "@/lib/content";

export const metadata: Metadata = {
  title: "Descargas",
  description:
    "Documentos descargables del FIP Festival: reglamento, formulario de inscripción, tarifario, categorías y más.",
  alternates: { canonical: "/descargas" },
  openGraph: {
    title: "Descargas · FIP Festival",
    description:
      "Documentos descargables del FIP Festival: reglamento, formulario de inscripción, tarifario, categorías y más.",
    url: "/descargas",
    type: "article",
  },
};

export default async function DescargasPage() {
  const locale = (await getLocale()) as Locale;
  const files = await getDownloadFiles(locale);

  // Group by section for better UX
  const sections = files.reduce<Map<string, typeof files>>((acc, file) => {
    const existing = acc.get(file.section) ?? [];
    existing.push(file);
    acc.set(file.section, existing);
    return acc;
  }, new Map());

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Descargas" }]} />
        <h1 className="mt-6 font-title text-4xl font-black md:text-5xl">
          Descargas
        </h1>
      </Section>

      {files.length === 0 ? (
        <Section bg="mid">
          <p className="text-center text-fip-white/60">
            No hay archivos disponibles por el momento.
          </p>
        </Section>
      ) : (
        Array.from(sections.entries()).map(([section, sectionFiles]) => (
          <Section key={section} bg="mid">
            {sections.size > 1 && (
              <h2 className="mb-6 font-title text-xl font-bold uppercase tracking-wide text-fip-gold">
                {section}
              </h2>
            )}
            <div className="flex flex-wrap gap-4">
              {sectionFiles.map((file) => (
                <DownloadButton
                  key={file.key}
                  label={file.label}
                  href={file.fileUrl}
                />
              ))}
            </div>
          </Section>
        ))
      )}

      <BackToTop />
    </>
  );
}
