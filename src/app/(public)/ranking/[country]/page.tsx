import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Placeholder from "@/components/shared/Placeholder";
import { RANKING_COUNTRIES } from "@/lib/navigation";

export function generateStaticParams() {
  return RANKING_COUNTRIES.map(({ slug }) => ({ country: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const match = RANKING_COUNTRIES.find((c) => c.slug === country);
  return { title: `Ranking ${match?.label ?? country}` };
}

export default async function RankingCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const match = RANKING_COUNTRIES.find((c) => c.slug === country);
  if (!match) notFound();
  return <Placeholder title={`Ranking ${match.label}`} eyebrow="Rankings" />;
}
