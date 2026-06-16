import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import type { Sponsor } from "@/mocks/types";

export default function SponsorsGrid({
  heading,
  sponsors,
}: {
  heading: string;
  sponsors: Sponsor[];
}) {
  return (
    <Section bg="base">
      <SectionHeading>{heading}</SectionHeading>
      <ul className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((sponsor) => (
          <li
            key={sponsor.name}
            className="flex h-20 w-40 items-center justify-center rounded-md bg-fip-white px-4 text-center text-sm font-bold text-fip-purple-900"
            title={sponsor.name}
          >
            {sponsor.name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
