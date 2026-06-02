import Cta from "@/components/shared/Cta";
import DownloadButton from "@/components/shared/DownloadButton";
import ImagePlaceholder from "@/components/shared/ImagePlaceholder";
import type { InscripcionStep } from "@/mocks/types";

/** A single inscription step: anchor, step label, title, body, optional bullets,
 *  help links, CTA, download buttons and a TODO image. */
export default function StepSection({ step }: { step: InscripcionStep }) {
  return (
    <article id={step.id} className="scroll-mt-28">
      <p className="text-center text-sm uppercase tracking-widest text-fip-gold">
        {step.step}
      </p>
      <h2 className="mt-2 text-center font-title text-2xl font-black md:text-3xl">
        {step.title}
      </h2>

      <div className="mx-auto mt-6 max-w-3xl space-y-4 text-fip-white/85">
        {step.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}

        {step.bullets && (
          <ul className="list-disc space-y-1 pl-6">
            {step.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        {step.links && (
          <ul className="space-y-1">
            {step.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-fip-gold underline-offset-2 hover:underline"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {step.imageTodo && (
        <div className="mt-8 flex justify-center">
          <ImagePlaceholder
            label={step.imageTodo}
            className="aspect-[3/2] w-full max-w-sm"
          />
        </div>
      )}

      {step.cta && (
        <div className="mt-8 text-center">
          <Cta href={step.cta.href} variant="outline" size="lg">
            {step.cta.label}
          </Cta>
        </div>
      )}

      {step.downloads && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {step.downloads.map((d) => (
            <DownloadButton
              key={`${d.href}-${d.lang}`}
              label={d.label}
              href={d.href}
              lang={d.lang}
            />
          ))}
        </div>
      )}
    </article>
  );
}
