import Cta from "@/components/shared/Cta";
import { home } from "@/mocks";

/** TODO: el "27 años" original es un sello SVG (/images/home/sello-27.svg). Acá se
 *  reemplaza por un badge CSS equivalente hasta tener el asset real. */
function YearBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-fip-gold text-fip-purple-900 shadow-lg">
      <span className="font-title text-2xl font-black leading-none">{number}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

/**
 * Full-bleed hero banner matching the original composition: background image
 * (placeholder until the real asset lands), right-aligned overlaid text, "27" sello
 * top-right, and a faded "GANADORES FIP" watermark.
 */
export default function Hero() {
  const { hero } = home;
  return (
    <section className="relative isolate overflow-hidden bg-fip-purple-900">
      {/* Background image placeholder + readability gradient */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-fip-purple-700/40">
        <span className="px-6 text-center text-[11px] uppercase tracking-widest text-fip-white/25">
          {hero.imageTodo}
        </span>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fip-purple-900/40 via-fip-purple-900/20 to-fip-purple-900/90" />

      {/* Sello top-right */}
      <div className="absolute right-6 top-6 z-10 hidden md:block">
        <YearBadge number={hero.badgeNumber} label={hero.badgeLabel} />
      </div>

      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-6 py-20 md:min-h-[68vh]">
        <div className="ml-auto max-w-2xl text-center md:text-right">
          <h1 className="font-title text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
            {hero.titleLead}{" "}
            <span className="text-fip-gold">
              {hero.highlight} {hero.titleTail}
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-end">
            <Cta href={hero.ctaHref} variant="outline" size="lg">
              {hero.ctaLabel}
            </Cta>
          </div>
        </div>
      </div>

      {/* Watermark — TODO: confirmar si es texto fijo o parte del arte del hero */}
      <span className="pointer-events-none absolute -bottom-2 left-4 select-none font-impact text-5xl uppercase text-fip-white/5 md:text-7xl">
        Ganadores FIP
      </span>
    </section>
  );
}
