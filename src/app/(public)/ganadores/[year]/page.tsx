import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Placeholder from "@/components/shared/Placeholder";
import { GANADOR_YEARS } from "@/lib/navigation";

export function generateStaticParams() {
  return GANADOR_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return { title: `Campeones del FIP ${year}` };
}

export default async function GanadoresYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  if (!GANADOR_YEARS.includes(Number(year))) notFound();
  return <Placeholder title={`Campeones del FIP ${year}`} eyebrow="Ganadores" />;
}
