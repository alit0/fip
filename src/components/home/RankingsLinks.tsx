import Link from "next/link";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { RANKING_COUNTRIES } from "@/lib/navigation";

export default function RankingsLinks({ heading }: { heading: string }) {
  return (
    <Section bg="mid">
      <SectionHeading>{heading}</SectionHeading>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {RANKING_COUNTRIES.map((country) => (
          <li key={country.slug}>
            <Link
              href={`/ranking/${country.slug}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-fip-white/15 p-4 transition hover:border-fip-gold hover:bg-fip-white/5"
            >
              {/* TODO: bandera real (/images/flag/*) pendiente */}
              <span className="grid h-8 w-12 place-items-center rounded-sm border border-dashed border-fip-white/30 text-[9px] uppercase text-fip-white/40">
                {country.slug.slice(0, 3)}
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-fip-white/90">
                {country.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
