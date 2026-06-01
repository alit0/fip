import Cta from "@/components/shared/Cta";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import { home } from "@/mocks";

/** TODO: el "27 años" original es un sello SVG (/images/home/sello-27.svg). Acá se
 *  reemplaza por un badge CSS equivalente hasta tener el asset real. */
function YearBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-fip-gold text-fip-purple-900 shadow-lg">
      <span className="font-title text-3xl font-black leading-none">{number}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function Hero() {
  const { hero } = home;
  return (
    <section className="bg-fip-purple-900">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <ImagePlaceholder label={hero.imageTodo} className="aspect-[4/3] w-full" />
        <div>
          <h1 className="font-title text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
            {hero.titleLead}{" "}
            <span className="text-fip-gold">{hero.highlight}</span> {hero.titleTail}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <YearBadge number={hero.badgeNumber} label={hero.badgeLabel} />
            <Cta href={hero.ctaHref} variant="outline" size="lg">
              {hero.ctaLabel}
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
