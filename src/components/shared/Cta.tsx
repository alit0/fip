import Link from "next/link";

type Variant = "solid" | "outline";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-fip-gold text-fip-purple-900 hover:brightness-110",
  outline:
    "border border-fip-white/80 text-fip-white hover:bg-fip-white hover:text-fip-purple-900",
};

const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-xs",
  lg: "px-7 py-3.5 text-sm",
};

/** Treat downloads and absolute URLs as plain anchors; everything else is a Link. */
function isExternal(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith("/descargas");
}

export default function Cta({
  href,
  children,
  variant = "solid",
  size = "md",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const classes = `inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest transition ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (isExternal(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
