import { PROTECTED_AREAS, type ProtectedArea } from "./roles";

export interface GateRedirect {
  redirect: string;
}

/**
 * Pure routing-gate decision used by the middleware.
 *
 * Login pages (`/acceso/{area}`) are public. Anything deeper
 * (`/acceso/{area}/<sub>`) is a protected area: without a session cookie the
 * user is redirected to that area's login, preserving the `/pt` locale prefix.
 *
 * This is a first-line UX gate only. The real authorization boundary is
 * server-side via {@link requireRole} — a present cookie is NOT proof of a
 * valid session or the right role.
 *
 * @param pathname the request pathname (may start with `/pt`)
 * @param hasSession whether the session cookie is present
 * @returns a redirect target, or null when the path is allowed through
 */
export function authGate(
  pathname: string,
  hasSession: boolean,
): GateRedirect | null {
  // Peel off an optional `/pt` locale prefix so the rest can be matched once.
  const ptMatch = pathname.match(/^\/pt(\/.*)?$/);
  const prefix = ptMatch ? "/pt" : "";
  const rest = ptMatch ? (ptMatch[1] ?? "/") : pathname;

  // Only sub-paths under /acceso/<area> are protected, not the login root.
  const m = rest.match(/^\/acceso\/([^/]+)\/.+/);
  if (!m) return null;

  const area = m[1];
  if (!(area in PROTECTED_AREAS)) return null;

  if (hasSession) return null;
  return { redirect: `${prefix}/acceso/${area as ProtectedArea}` };
}
