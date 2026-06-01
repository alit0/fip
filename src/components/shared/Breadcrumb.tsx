import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Internal-page breadcrumb, e.g. Home > Reglamento. */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-widest">
      <ol className="flex flex-wrap items-center gap-1 text-fip-white/55">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-fip-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-fip-white/80">{item.label}</span>
            )}
            {i < items.length - 1 && <ChevronRight size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
