import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import type { Role } from "./roles";

export interface AuthedUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Server-side authorization guard for protected pages. This — not the
 * middleware — is the real security boundary.
 *
 * Fail-closed: if the DB is unavailable, the session is missing/invalid, or the
 * user's role does not match, the request is redirected to `loginPath`. A user
 * is never let through on uncertainty.
 *
 * Usage (Phase 5/6 pages):
 *   const user = await requireRole("agency", "/acceso/agencias");
 *
 * @param role the role required to view the page
 * @param loginPath where to send unauthorized requests (the area login)
 */
export async function requireRole(
  role: Role,
  loginPath: string,
): Promise<AuthedUser> {
  const payload = await getPayloadClient();
  if (!payload) redirect(loginPath); // no DB => no auth => deny (fail-closed)

  let sessionUser: unknown = null;
  try {
    const result = await payload.auth({
      headers: (await nextHeaders()) as unknown as Headers,
    });
    sessionUser = result.user;
  } catch {
    redirect(loginPath); // auth verification failed => deny
  }

  const u = sessionUser as
    | { id?: string | number; email?: string; role?: Role }
    | null;
  if (!u || u.role !== role) redirect(loginPath);

  return { id: String(u.id), email: u.email ?? "", role: u.role as Role };
}
