"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  MAIN_NAV,
  JURADO_YEARS,
  GANADOR_YEARS,
} from "@/lib/navigation";

const DROPDOWN_ITEMS = {
  jurados: JURADO_YEARS.map((y) => ({ label: String(y), href: `/jurados/${y}` })),
  ganadores: GANADOR_YEARS.map((y) => ({ label: String(y), href: `/ganadores/${y}` })),
} as const;

export default function MainNav() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav className="bg-fip-purple-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-impact text-xl tracking-wide text-fip-white">
          FIP<span className="text-fip-gold">.</span>
        </Link>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-[13px] uppercase tracking-wider">
          {MAIN_NAV.map((item) => {
            if ("href" in item) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-fip-white/85 transition-colors hover:text-fip-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            const items = DROPDOWN_ITEMS[item.dropdown];
            const isOpen = open === item.dropdown;
            return (
              <li
                key={item.dropdown}
                className="relative"
                onMouseEnter={() => setOpen(item.dropdown)}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.dropdown)}
                  className="flex items-center gap-1 uppercase text-fip-white/85 transition-colors hover:text-fip-gold"
                >
                  {item.label}
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
      </div>
    </nav>
  );
}
