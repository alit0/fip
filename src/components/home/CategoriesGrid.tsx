import Link from "next/link";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { home, rubros } from "@/mocks";

export default function CategoriesGrid() {
  return (
    <Section bg="base">
      <SectionHeading>{home.categories.heading}</SectionHeading>
      <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {rubros.map((rubro) => (
          <li key={rubro.number}>
            <Link
              href={rubro.href}
              className="flex items-center gap-3 rounded-md bg-fip-gold px-4 py-3 font-body text-sm font-bold text-fip-purple-900 transition hover:brightness-110"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fip-purple-900 text-xs text-fip-gold">
                {rubro.number}
              </span>
              <span className="leading-tight">{rubro.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
