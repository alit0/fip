import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { authGate } from "@/lib/auth/gate";

const intlMiddleware = createMiddleware(routing);

// Payload's auth cookie (default `${cookiePrefix}-token`, prefix defaults to "payload").
const SESSION_COOKIE = "payload-token";

/**
 * Combined middleware: a lightweight auth gate in front of next-intl i18n.
 *
 * The gate only redirects unauthenticated requests away from protected areas
 * (cookie-presence check — UX, not security). Everything else is delegated to
 * the i18n middleware untouched, so locale routing keeps working. The real
 * authorization check happens server-side in the pages via requireRole().
 */
export default function middleware(req: NextRequest): NextResponse {
  const gate = authGate(
    req.nextUrl.pathname,
    req.cookies.has(SESSION_COOKIE),
  );

  if (gate) {
    const url = req.nextUrl.clone();
    url.pathname = gate.redirect;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // Corre en todo menos archivos estáticos, _next, rutas de API y admin de Payload.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
