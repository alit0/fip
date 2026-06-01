import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import MuestraDigital from "@/components/home/MuestraDigital";
import AwardsGrid from "@/components/home/AwardsGrid";
import InstitutionalText from "@/components/home/InstitutionalText";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import JurorsHighlight from "@/components/home/JurorsHighlight";
import SponsorsGrid from "@/components/home/SponsorsGrid";
import RankingsLinks from "@/components/home/RankingsLinks";

const description =
  "El FIP celebra sus 27 años de exitosa trayectoria. Festival Iberoamericano de Promociones y Eventos: jurados, ganadores, categorías y rankings por país.";

export const metadata: Metadata = {
  // override the templated title so the Home tab reads cleanly
  title: "FIP Festival — 27 años de trayectoria",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "FIP Festival — Festival Iberoamericano de Promociones y Eventos",
    description,
    url: "/",
    siteName: "FIP Festival",
    locale: "es_AR",
    type: "website",
    // TODO: imagen Open Graph real pendiente (asset).
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <MuestraDigital />
      <AwardsGrid />
      <InstitutionalText />
      <CategoriesGrid />
      <JurorsHighlight />
      <SponsorsGrid />
      <RankingsLinks />
    </>
  );
}
