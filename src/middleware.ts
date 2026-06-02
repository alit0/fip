import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Corre en todo menos archivos estáticos, _next y rutas de API.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
