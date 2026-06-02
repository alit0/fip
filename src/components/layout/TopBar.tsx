import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRIVATE_ACCESS } from "@/lib/navigation";
import { getSiteConfig } from "@/lib/content";
import SocialIcons from "./SocialIcons";

export default async function TopBar() {
  const [{ social }, t] = await Promise.all([
    getSiteConfig(),
    getTranslations("access"),
  ]);

  return (
    <div className="border-b border-white/10 bg-fip-purple-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs uppercase tracking-widest">
        <nav className="flex items-center gap-4">
          {PRIVATE_ACCESS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              className="text-fip-white/80 transition-colors hover:text-fip-gold"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <SocialIcons links={social} />
      </div>
    </div>
  );
}
