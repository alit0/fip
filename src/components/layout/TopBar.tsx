import Link from "next/link";
import { PRIVATE_ACCESS } from "@/lib/navigation";
import SocialIcons from "./SocialIcons";

export default function TopBar() {
  return (
    <div className="border-b border-white/10 bg-fip-purple-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs uppercase tracking-widest">
        <nav className="flex items-center gap-4">
          {PRIVATE_ACCESS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-fip-white/80 transition-colors hover:text-fip-gold"
            >
              {label}
            </Link>
          ))}
        </nav>
        <SocialIcons />
      </div>
    </div>
  );
}
