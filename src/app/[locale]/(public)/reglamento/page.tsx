import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import DownloadButton from "@/components/shared/DownloadButton";
import BackToTop from "@/components/shared/BackToTop";
import AnchorIndex from "@/components/reglamento/AnchorIndex";
import ArticleSection from "@/components/reglamento/ArticleSection";
import { getReglamento } from "@/lib/content";

const description =
  "Reglamento oficial del FIP Festival: artículos generales, aclaraciones complementarias y tabla de puntajes. Descargable en español y portugués.";

export const metadata: Metadata = {
  title: "Reglamento",
  description,
  alternates: { canonical: "/reglamento" },
  openGraph: {
    title: "Reglamento · FIP Festival",
    description,
    url: "/reglamento",
    type: "article",
  },
};

export default async function ReglamentoPage() {
  const { intro, downloads, articles, scoreTable } = await getReglamento();

  return (
    <>
      <Section bg="base" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Reglamento" }]} />
        <h1 className="mt-6 font-title text-4xl font-black md:text-5xl">Reglamento</h1>
        <p className="mt-6 max-w-3xl text-fip-white/80">{intro}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <DownloadButton label={downloads.es.label} href={downloads.es.href} lang="ES" />
          <DownloadButton label={downloads.pt.label} href={downloads.pt.href} lang="PT" />
        </div>
      </Section>

      <Section bg="mid">
        <h2 className="mb-6 font-title text-xl font-bold uppercase tracking-wide text-fip-gold">
          Índice
        </h2>
        <AnchorIndex articles={articles} />
      </Section>

      <Section bg="base">
        <div className="space-y-8">
          {articles.map((article) => (
            <ArticleSection
              key={article.letter}
              article={article}
              scoreTable={scoreTable}
            />
          ))}
        </div>
      </Section>

      <BackToTop />
    </>
  );
}
