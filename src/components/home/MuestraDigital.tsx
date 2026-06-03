import Section from "@/components/shared/Section";
import Cta from "@/components/shared/Cta";
import type { HomeContent } from "@/mocks/types";

/**
 * Live site `<section class="video">`: a standalone band holding only the
 * "Informe Ganadores" download CTA — no title, no image (see _scratch/Muestra_Digital_Analisis.md).
 */
export default function MuestraDigital({
  data,
}: {
  data: HomeContent["muestraDigital"];
}) {
  return (
    <Section bg="base">
      <div className="flex justify-center">
        <Cta href={data.ctaHref} variant="solid" size="lg">
          {data.ctaLabel}
        </Cta>
      </div>
    </Section>
  );
}
