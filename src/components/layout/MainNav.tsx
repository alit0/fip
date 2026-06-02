"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MAIN_NAV, JURADO_YEARS, GANADOR_YEARS } from "@/lib/navigation";

const DROPDOWN_ITEMS = {
  jurados: JURADO_YEARS.map((y) => ({ label: String(y), href: `/jurados/${y}` })),
  ganadores: GANADOR_YEARS.map((y) => ({ label: String(y), href: `/ganadores/${y}` })),
} as const;

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="font-impact text-xl tracking-wide text-fip-white"
    >
      FIP<span className="text-fip-gold">.</span>
    </Link>
  );
}

export default function MainNav() {
  const t = useTranslations("nav");
  // desktop hover dropdown
  const [hovered, setHovered] = useState<string | null>(null);
  // mobile drawer + which accordion is expanded
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setExpanded(null);
  };

  return (
    <nav className="bg-fip-purple-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        {/* ---------- Desktop nav (lg and up) ---------- */}
        <ul className="hidden items-center gap-x-5 font-body text-[13px] uppercase tracking-wider lg:flex">
          {MAIN_NAV.map((item) => {
            if ("href" in item) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-fip-white/85 transition-colors hover:text-fip-gold"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            }

            const items = DROPDOWN_ITEMS[item.dropdown];
            const isOpen = hovered === item.dropdown;
            return (
              <li
                key={item.dropdown}
                className="relative"
                onMouseEnter={() => setHovered(item.dropdown)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex items-center gap-1 uppercase text-fip-white/85 transition-colors hover:text-fip-gold"
                >
                  {t(item.key)}
                  <ChevronDown size={14} />
                </button>
                {isOpen && (
                  <ul className="absolute left-0 top-full z-50 min-w-[8rem] rounded-md border border-white/10 bg-fip-purple-700 py-2 shadow-xl">
                    {items.map(({ label, href }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="block px-4 py-1.5 text-fip-white/85 transition-colors hover:bg-fip-purple-500 hover:text-fip-gold"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* ---------- Mobile hamburger toggle (below lg) ---------- */}
        <button
          type="button"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="text-fip-white lg:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div className="border-t border-white/10 lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-6 py-2 font-body text-sm uppercase tracking-wider">
            {MAIN_NAV.map((item) => {
              if ("href" in item) {
                return (
                  <li key={item.href} className="border-b border-white/5">
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-3 text-fip-white/85 transition-colors hover:text-fip-gold"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              }

              const items = DROPDOWN_ITEMS[item.dropdown];
              const isExpanded = expanded === item.dropdown;
              return (
                <li key={item.dropdown} className="border-b border-white/5">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpanded(isExpanded ? null : item.dropdown)}
                    className="flex w-full items-center justify-between py-3 uppercase text-fip-white/85 transition-colors hover:text-fip-gold"
                  >
                    {t(item.key)}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isExpanded && (
                    <ul className="pb-2 pl-4">
                      {items.map(({ label, href }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={closeMobile}
                            className="block py-2 text-fip-white/70 transition-colors hover:text-fip-gold"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
