"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  es: "ES",
  pt: "PT",
  en: "EN",
  fr: "FR",
  it: "IT",
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-fip-white/85 transition-colors hover:text-fip-gold uppercase text-[13px] tracking-wider"
      >
        <Globe size={14} />
        {LOCALE_LABELS[locale]}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-50 mt-1 min-w-[5rem] rounded-md border border-white/10 bg-fip-purple-700 py-2 shadow-xl">
          {(routing.locales as unknown as string[]).map((loc) => (
            <li key={loc}>
              <button
                type="button"
                onClick={() => switchLocale(loc)}
                className={`block w-full px-4 py-1.5 text-left text-[13px] uppercase tracking-wider transition-colors hover:bg-fip-purple-500 hover:text-fip-gold ${
                  loc === locale ? "text-fip-gold" : "text-fip-white/85"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
