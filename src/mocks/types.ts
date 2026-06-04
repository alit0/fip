/**
 * Types for the Phase 2 mock fixtures.
 * These mirror the data model agreed in Phase 1 and will be replaced by Payload
 * generated types in Phase 3. JSON files are typed on import via mocks/index.ts.
 *
 * `photoUrl` / `logoUrl` are intentionally nullable: real image assets do not exist
 * yet (the ./img screenshots are visual references, not usable assets). Null → render
 * an <ImagePlaceholder> marked TODO.
 */

export interface AwardLink {
  label: string;
  href: string;
}

export interface Rubro {
  number: number;
  code: string;
  name: string;
  /** anchor target on the Categorías page, e.g. /categorias#rubro-1 */
  href: string;
}

export interface Juror {
  slug: string;
  name: string;
  country: string;
  /** TODO: role/subtitle not provided in audit for 2026 list */
  role: string | null;
  /** TODO: agency/company not provided in audit for 2026 list */
  agency: string | null;
  /** TODO: real photo asset pending */
  photoUrl: string | null;
}

export interface Sponsor {
  name: string;
  /** TODO: real logo asset pending */
  logoUrl: string | null;
  url: string | null;
}

export interface SocialLink {
  name: string;
  href: string;
}

export interface DownloadLink {
  label: string;
  href: string;
}

/** Site-wide config. Phase 3: backed by the Payload SiteConfig global. */
export interface SiteConfig {
  contact: {
    address: string;
    whatsapp: string;
    tel: string;
    office: string;
    email: string;
  };
  social: SocialLink[];
  downloads: { es: DownloadLink[]; pt: DownloadLink[] };
}

export interface InscripcionDownload {
  label: string;
  href: string;
  lang: "ES" | "PT";
}

export interface InscripcionStep {
  /** anchor id, e.g. "inscripcion" */
  id: string;
  /** "Paso 1 • Inscripción" */
  step: string;
  /** "1. Complete el formulario de inscripción" */
  title: string;
  body: string[];
  bullets?: string[];
  /** inline help / intra-page anchor links */
  links?: { text: string; href: string }[];
  /** optional call to action, e.g. Ingreso Agencias */
  cta?: { label: string; href: string };
  downloads?: InscripcionDownload[];
  /** TODO image (e.g. the 60×40 lámina format diagram) */
  imageTodo?: string;
}

export interface InscripcionAspect {
  number: number;
  title: string;
  body: string[];
}

export interface Inscripcion {
  title: string;
  subtitle: string;
  index: { label: string; href: string }[];
  steps: InscripcionStep[];
  condiciones: { title: string; body: string };
  contenido: {
    id: string;
    title: string;
    question: string;
    aspects: InscripcionAspect[];
  };
}

export interface DiscountRow {
  descuento: string;
  tipo: string;
  condicion: string;
  vigencia: string;
}

export interface ClosingRow {
  /** region name or process stage */
  label: string;
  detail: string;
  date: string;
}

export interface FechasCierre {
  title: string;
  intro: string;
  discounts: { heading: string; rows: DiscountRow[] };
  closings: {
    heading: string;
    regions: ClosingRow[];
    milestones: ClosingRow[];
    note: string;
  };
}

export interface TarifarioFee {
  label: string;
  desc?: string;
  price: string;
}

export interface TarifarioSection {
  heading: string;
  items: { title: string; body: string }[];
}

export interface Tarifario {
  title: string;
  notice: string;
  baseFees: { items: { label: string; price: string }[] };
  quantityDiscounts: string[];
  otherFees: TarifarioFee[];
  feesNote: string;
  downloads: {
    es: { label: string; href: string };
    pt: { label: string; href: string };
  };
  sections: TarifarioSection[];
}

export interface Trophy {
  name: string;
  description: string;
  price: string;
  /** TODO: real trophy image asset pending */
  imageTodo: string;
}

export interface PremiosShippingRow {
  label: string;
  price: string;
}

export interface Premios {
  title: string;
  intro: string;
  orderEmail: string;
  priceNotice: string;
  trophies: Trophy[];
  shipping: { heading: string; note: string; rows: PremiosShippingRow[] };
  /** payment methods + shipping conditions; same shape as Tarifario text blocks */
  sections: TarifarioSection[];
  downloads: {
    es: { label: string; href: string };
    pt: { label: string; href: string };
  };
}

/** One juror on the per-year Jurados page (app/[locale]/(public)/jurados/[year]). */
export interface JuradoYearEntry {
  slug: string;
  name: string;
  /** Cargo / subtitle (separated from bio in the v2 source). May be empty. */
  role: string;
  /** Agency. Present mainly for recent years (2026/2025); empty otherwise. */
  agency: string;
  /** Country name. May be empty when the source did not have it. */
  country: string;
  /** ISO-3166-1 alpha-2 country code derived by the content layer when available. */
  countryCode?: string | null;
  /** Country flag emoji. NOTE: fabricated by the relevamiento (not in the live HTML). */
  countryFlag: string;
  /** Long biography. May be empty. */
  bio: string;
  /** TODO: real juror photo asset pending */
  photoUrl: string | null;
  /**
   * INTERNAL provenance flag — NOT rendered. true = país/bandera read from the live
   * site (2026/2025); false = inferred by the relevamiento (slug-derived país, mapped
   * flag) for older editions. Kept for the final live-verification pass.
   */
  countryVerified: boolean;
  order: number;
}

/** Jurors keyed by edition year ("2020"…"2026"). */
export type JuradosByYear = Record<string, JuradoYearEntry[]>;

export interface InstitutionalSection {
  title: string;
  body: string;
}

/** A Hall of Fame member (app/[locale]/(public)/hall-de-la-fama). */
export interface HallMember {
  slug: string;
  name: string;
  /** cargo / role; may be empty */
  role: string;
  /** empresa; may be empty */
  company: string;
  country: string;
  /** ISO-3166-1 alpha-2 for <CountryFlag>; null when unknown */
  countryCode: string | null;
  /** TODO: real photo asset pending */
  photoUrl: string | null;
  /** source logo path when the member has one (→ placeholder); null otherwise */
  logoTodo: string | null;
  /**
   * Text biography. Only present for César González & Ángel Pedrote; for the rest the
   * bio is an image on the live site (see bioImageTodo), so this is empty.
   */
  bioText: string;
  /** Path of the _info.png when the bio is an image asset (→ placeholder); null otherwise. */
  bioImageTodo: string | null;
  order: number;
}

export interface HallDeLaFama {
  title: string;
  /** Institutional copy: ~11 apartados (qué es, principios, criterios, jury, …). */
  institutional: InstitutionalSection[];
  members: HallMember[];
}

export interface ScoreRow {
  award: string;
  points: number;
}

export interface RegulationArticle {
  /** A–R */
  letter: string;
  /** theme/title from the audit (table 4) */
  theme: string;
  /** TODO: full legal body, verbatim from the live site / PDF */
  body: string | null;
  /** the recurring score table appears inside some articles (e.g. F, K) */
  showScoreTable?: boolean;
}

export type AwardIcon = "oro" | "cristal" | "platino";

export interface Category {
  rubroNumber: number;
  /** e.g. MP.6 */
  code: string;
  /** real title from categorias.png; null = TODO (pending from categorias.pdf) */
  title: string | null;
  /** TODO: long description, verbatim from the live site / PDF */
  description: string | null;
  award: AwardIcon;
  isSpecial: boolean;
  /** e.g. "Gran Prix" / "Platino"; null when unknown */
  specialType: string | null;
  isNew: boolean;
}

export interface CategoriasPage {
  subtitle: string;
  downloads: {
    es: { label: string; href: string };
    pt: { label: string; href: string };
  };
  ventajas: { title: string; body: string | null }[];
  /** audit code ranges per rubro number, for rubros not yet transcribed */
  categoryRanges: Record<string, string>;
  todo: string;
}

export interface Reglamento {
  intro: string;
  introTodo: string;
  downloads: {
    es: { label: string; href: string };
    pt: { label: string; href: string };
  };
  scoreTable: ScoreRow[];
  articles: RegulationArticle[];
  articlesTodo: string;
}

export interface HomeContent {
  hero: {
    titleLead: string;
    highlight: string;
    titleTail: string;
    badgeNumber: string;
    badgeLabel: string;
    ctaLabel: string;
    ctaHref: string;
    imageTodo: string;
  };
  muestraDigital: {
    ctaLabel: string;
    ctaHref: string;
  };
  awards: {
    heading: string;
    items: AwardLink[];
  };
  institutional: {
    heading: string;
    /** verbatim intro copy, one entry per paragraph */
    intro: string[];
    sections: InstitutionalSection[];
    ctaLabel: string;
    ctaHref: string;
  };
  categories: { heading: string };
  jurors: { heading: string; ctaLabel: string; ctaHref: string; todo: string };
  sponsors: { heading: string; todo: string };
  rankings: { heading: string };
}
