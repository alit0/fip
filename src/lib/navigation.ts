/**
 * Structural navigation/routing config — this is CODE, not content.
 * Labels are i18n keys (resolved via next-intl); contact/social/downloads live in
 * the content layer (getSiteConfig). Years/countries map to Editions in Phase 3.
 */

export type NavItem =
  | { key: string; href: string }
  | { key: string; dropdown: "jurados" | "ganadores" };

// Order is exact, per audit section 3.2. `key` resolves against the "nav" messages.
export const MAIN_NAV: NavItem[] = [
  { key: "reglamento", href: "/reglamento" },
  { key: "categorias", href: "/categorias" },
  { key: "inscripcion", href: "/inscripcion" },
  { key: "fechas", href: "/fechas-de-cierre" },
  { key: "tarifario", href: "/tarifario" },
  { key: "premios", href: "/premios" },
  { key: "jurados", dropdown: "jurados" },
  { key: "ganadores", dropdown: "ganadores" },
  { key: "hall", href: "/hall-de-la-fama" },
  { key: "contacto", href: "/contacto" },
];

// Jurados 2020–2026 (dropdown shows newest first).
export const JURADO_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

// Ganadores 2019–2025 (newest first). NOTE: in the original, 2024 & 2023 link to a
// PDF instead of a page — handled in Phase 2/3; here all route to a page placeholder.
export const GANADOR_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

export const RANKING_COUNTRIES = [
  { slug: "colombia", label: "Colombia" },
  { slug: "argentina", label: "Argentina" },
  { slug: "brasil", label: "Brasil" },
  { slug: "espana", label: "España" },
  { slug: "peru", label: "Perú" },
  { slug: "mexico", label: "México" },
];

// `key` resolves against the "access" messages.
export const PRIVATE_ACCESS = [
  { key: "jurados", href: "/acceso/jurados" },
  { key: "agencias", href: "/acceso/agencias" },
];
