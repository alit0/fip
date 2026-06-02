import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Navegación locale-aware: estos Link/redirect/etc. agregan el prefijo de idioma
// automáticamente según el locale actual. Usar en vez de next/link para rutas internas.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
