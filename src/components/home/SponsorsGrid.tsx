import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { home, sponsors } from "@/mocks";

export default function SponsorsGrid() {
  return (
    <Section bg="base">
      <SectionHeading>{home.sponsors.heading}</SectionHeading>
      <ul className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((sponsor) => (
          <li
            key={sponsor.name}
            className="flex h-20 w-40 items-center justify-center rounded-md bg-fip-white px-4 text-center text-sm font-bold text-fip-purple-900"
            title="TODO: logo real pendiente"
          >
            {sponsor.name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
