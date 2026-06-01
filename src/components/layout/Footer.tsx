import Link from "next/link";
import {
  CONTACT,
  DOWNLOADS_ES,
  DOWNLOADS_PT,
} from "@/lib/navigation";
import SocialIcons from "./SocialIcons";

function DownloadColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
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

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-fip-purple-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Block 1: Seguinos en + logo */}
        <div>
          <Link href="/" className="font-impact text-2xl text-fip-white">
            FIP<span className="text-fip-gold">.</span>
          </Link>
          <p className="mt-3 mb-4 text-sm uppercase tracking-widest text-fip-white/60">
            Seguinos en
          </p>
          <SocialIcons />
        </div>

        {/* Block 2: descargas ES */}
        <DownloadColumn title="Descargas (ES)" items={DOWNLOADS_ES} />

        {/* Block 3: descargas PT */}
        <DownloadColumn title="Downloads (PT)" items={DOWNLOADS_PT} />

        {/* Block 4: contacto */}
        <div>
          <h3 className="mb-3 font-title text-sm font-bold uppercase tracking-widest text-fip-gold">
            Contacto
          </h3>
          <ul className="space-y-1.5 text-sm text-fip-white/75">
            <li>{CONTACT.address}</li>
            <li>WhatsApp: {CONTACT.whatsapp}</li>
            <li>Tel: {CONTACT.tel}</li>
            <li>Oficina: {CONTACT.office}</li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors hover:text-fip-gold"
              >
                {CONTACT.email}
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
