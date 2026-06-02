import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DownloadLink } from "@/mocks/types";
import { getSiteConfig } from "@/lib/content";
import SocialIcons from "./SocialIcons";

function DownloadColumn({
  title,
  items,
}: {
  title: string;
  items: DownloadLink[];
}) {
  return (
    <div>
      <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-widest text-fip-gold">
        {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              className="text-fip-white/75 transition-colors hover:text-fip-gold"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const [{ contact, social, downloads }, t] = await Promise.all([
    getSiteConfig(),
    getTranslations("footer"),
  ]);

  return (
    <footer className="border-t border-white/10 bg-fip-purple-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Block 1: Seguinos en + logo */}
        <div>
          <Link href="/" className="font-impact text-2xl text-fip-white">
            FIP<span className="text-fip-gold">.</span>
          </Link>
          <p className="mt-3 mb-4 text-sm uppercase tracking-widest text-fip-white/60">
            {t("follow")}
          </p>
          <SocialIcons links={social} />
        </div>

        {/* Block 2: descargas ES */}
        <DownloadColumn title={t("downloadsEs")} items={downloads.es} />

        {/* Block 3: descargas PT */}
        <DownloadColumn title={t("downloadsPt")} items={downloads.pt} />

        {/* Block 4: contacto */}
        <div>
          <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-widest text-fip-gold">
            {t("contact")}
          </h3>
          <ul className="space-y-1.5 text-sm text-fip-white/75">
            <li>{contact.address}</li>
            <li>WhatsApp: {contact.whatsapp}</li>
            <li>Tel: {contact.tel}</li>
            <li>Oficina: {contact.office}</li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="transition-colors hover:text-fip-gold"
              >
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-fip-white/50">
        © {new Date().getFullYear()} FIP Festival — Festival Iberoamericano de
        Promociones y Eventos.
      </div>
    </footer>
  );
}
