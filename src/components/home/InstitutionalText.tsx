import Section from "@/components/shared/Section";
import Cta from "@/components/shared/Cta";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import { home } from "@/mocks";

export default function InstitutionalText() {
  const { institutional } = home;
  return (
    <Section bg="bright">
      <div className="grid items-start gap-10 md:grid-cols-[1fr_2fr]">
        <ImagePlaceholder
          label="Trofeo principal FIP (TODO)"
          className="mx-auto aspect-[3/4] w-full max-w-xs"
        />
        <div>
          <h2 className="font-title text-2xl font-black uppercase tracking-wide text-fip-gold md:text-3xl">
            {institutional.heading}
          </h2>
          <div className="mt-6 space-y-4 text-fip-white/90">
            {institutional.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {institutional.sections.map((s) => (
              <div key={s.title}>
                <h3 className="font-title text-lg font-bold text-fip-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-fip-white/85">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Cta href={institutional.ctaHref} variant="solid" size="lg">
              {institutional.ctaLabel}
            </Cta>
          </div>
        </div>
      </div>
    </Section>
  );
}
