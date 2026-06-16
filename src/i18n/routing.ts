import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "pt", "en", "fr", "it"],
  defaultLocale: "es",
  // ES queda SIN prefijo (/categorias); PT con prefijo (/pt/categorias).
  localePrefix: "as-needed",
});
