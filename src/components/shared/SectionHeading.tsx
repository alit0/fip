export default function SectionHeading({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <h2
      className={`font-title text-2xl font-black uppercase tracking-wide text-fip-gold md:text-3xl ${
        align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      {children}
    </h2>
  );
}
