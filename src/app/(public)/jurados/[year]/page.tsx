import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Placeholder from "@/components/shared/Placeholder";
import { JURADO_YEARS } from "@/lib/navigation";

export function generateStaticParams() {
  return JURADO_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return { title: `Jurados ${year}` };
}

export default async function JuradosYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  if (!JURADO_YEARS.includes(Number(year))) notFound();
  return <Placeholder title={`Jurados ${year}`} eyebrow="Jurados" />;
}
