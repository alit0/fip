import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import Cta from "@/components/shared/Cta";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import type { HomeContent, Juror } from "@/mocks/types";

export default function JurorsHighlight({
  labels,
  jurors,
}: {
  labels: HomeContent["jurors"];
  jurors: Juror[];
}) {
  return (
    <Section bg="mid">
      <SectionHeading>{labels.heading}</SectionHeading>
      <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {jurors.map((juror) => (
          <li key={juror.slug} className="flex flex-col items-center text-center">
            <ImagePlaceholder
              label="Foto del jurado"
              rounded="rounded-full"
              className="aspect-square w-24"
            />
            <span className="mt-3 text-sm font-bold text-fip-white">
              {juror.name}
            </span>
            <span className="text-xs uppercase tracking-wide text-fip-gold">
              {juror.country}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center">
        <Cta href={labels.ctaHref} variant="outline" size="lg">
          {labels.ctaLabel}
        </Cta>
      </div>
    </Section>
  );
}
