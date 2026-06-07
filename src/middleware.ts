import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Corre en todo menos archivos estáticos, _next, rutas de API y admin de Payload.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
