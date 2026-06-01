import Section from "@/components/shared/Section";
import Cta from "@/components/shared/Cta";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import { home } from "@/mocks";

export default function MuestraDigital() {
  const { muestraDigital } = home;
  return (
    <Section bg="base">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <ImagePlaceholder
          label={muestraDigital.imageTodo}
          className="aspect-[16/9] w-full"
        />
        <div className="text-center md:text-left">
          <h2 className="font-title text-3xl font-black uppercase tracking-wide md:text-4xl">
            {muestraDigital.heading}
          </h2>
          <div className="mt-6">
            <Cta href={muestraDigital.ctaHref} variant="solid" size="lg">
              {muestraDigital.ctaLabel}
            </Cta>
          </div>
        </div>
      </div>
    </Section>
  );
}
