/**
 * Empty page scaffold. Real sections/content are built in Phase 2.
 * Kept deliberately minimal — this only proves routing + layout + tokens work.
 */
export default function Placeholder({
  title,
  eyebrow = "FIP Festival",
  note,
}: {
  title: string;
  eyebrow?: string;
  note?: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <span className="text-sm uppercase tracking-[0.3em] text-fip-gold">
        {eyebrow}
      </span>
      <h1 className="mt-3 font-title text-5xl font-black leading-tight md:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-prose text-fip-white/55">
        {note ?? "Placeholder — el contenido de esta página se construye en la Fase 2."}
      </p>
    </section>
  );
}
