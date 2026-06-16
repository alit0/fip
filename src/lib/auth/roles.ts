/**
 * Auth roles and the map of private URL areas to the role they require.
 * Pure module (no server/edge-specific imports) so it can be shared by the
 * middleware (edge), the Payload collection config (node) and tests.
 */
export const ROLES = ["agency", "juror", "admin"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Private areas, keyed by the URL segment under `/acceso/`, mapped to the role
 * required to enter them. `/acceso/agencias` and `/acceso/jurados` themselves
 * are the public login pages; only deeper sub-paths are protected.
 *
 * NOTE: the private areas live under `/acceso/*` on purpose. `/jurados/[year]`
 * is a PUBLIC page (the jurors listing), so the private juror area must not
 * collide with it.
 */
export const PROTECTED_AREAS = {
  agencias: "agency",
  jurados: "juror",
} as const satisfies Record<string, Role>;

export type ProtectedArea = keyof typeof PROTECTED_AREAS;
