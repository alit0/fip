import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import MuestraDigital from "@/components/home/MuestraDigital";
import AwardsGrid from "@/components/home/AwardsGrid";
import InstitutionalText from "@/components/home/InstitutionalText";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import JurorsHighlight from "@/components/home/JurorsHighlight";
import SponsorsGrid from "@/components/home/SponsorsGrid";
import RankingsLinks from "@/components/home/RankingsLinks";
import { getHomeContent, getRubros, getJurors, getSponsors } from "@/lib/content";

const description =
  "El FIP celebra sus 27 años de exitosa trayectoria. Festival Iberoamericano de Promociones y Eventos: jurados, ganadores, categorías y rankings por país.";

export const metadata: Metadata = {
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
  },
};

export default async function HomePage() {
  const [home, rubros, jurors, sponsors] = await Promise.all([
    getHomeContent(),
    getRubros(),
    getJurors(),
    getSponsors(),
  ]);

  return (
    <>
      <Hero hero={home.hero} />
      <MuestraDigital data={home.muestraDigital} />
      <AwardsGrid awards={home.awards} />
      <InstitutionalText institutional={home.institutional} />
      <CategoriesGrid heading={home.categories.heading} rubros={rubros} />
      <JurorsHighlight labels={home.jurors} jurors={jurors} />
      <SponsorsGrid heading={home.sponsors.heading} sponsors={sponsors} />
      <RankingsLinks heading={home.rankings.heading} />
    </>
  );
}
