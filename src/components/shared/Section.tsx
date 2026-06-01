type Bg = "base" | "mid" | "bright";

const BG: Record<Bg, string> = {
  base: "bg-fip-purple-900",
  mid: "bg-fip-purple-700",
  bright: "bg-fip-purple-500",
};

/** Full-width band with alternating purple background and a centered max-width inner. */
export default function Section({
  children,
  bg = "base",
  id,
  className = "",
}: {
  children: React.ReactNode;
  bg?: Bg;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`${BG[bg]} px-6 py-16 md:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
