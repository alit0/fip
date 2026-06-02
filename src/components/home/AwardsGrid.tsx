import Link from "next/link";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import Cta from "@/components/shared/Cta";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import type { HomeContent } from "@/mocks/types";

export default function AwardsGrid({
  awards,
}: {
  awards: HomeContent["awards"];
}) {
  return (
    <Section bg="mid">
      <SectionHeading>{awards.heading}</SectionHeading>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {awards.items.map((award) => (
          <Link
            key={award.label}
            href={award.href}
            className="group flex flex-col items-center gap-3 rounded-lg p-3 transition hover:bg-fip-white/5"
          >
            <ImagePlaceholder label="Trofeo (TODO)" className="aspect-square w-full" />
            <span className="text-center text-xs font-bold uppercase tracking-wide text-fip-white/90 group-hover:text-fip-gold">
              {award.label}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Cta href={awards.ctaHref} variant="solid" size="lg">
          {awards.ctaLabel}
        </Cta>
      </div>
    </Section>
  );
}
