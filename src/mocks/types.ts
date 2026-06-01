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

export interface InstitutionalSection {
  title: string;
  body: string;
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
    heading: string;
    ctaLabel: string;
    ctaHref: string;
    imageTodo: string;
  };
  awards: {
    heading: string;
    items: AwardLink[];
    ctaLabel: string;
    ctaHref: string;
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
