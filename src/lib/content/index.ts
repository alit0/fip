/**
 * Async content layer — the single boundary between the UI and the data source.
 * Pages/components import getters from here (never from @/mocks directly), so the
 * Phase 3 swap mock → Payload is internal to these files and pages don't change.
 * Every getter is async and locale-aware (the locale is wired up in Phase 4).
 */
export { type Locale, DEFAULT_LOCALE } from "./locale";
export { getSiteConfig } from "./site-config";
export { getHomeContent } from "./home";
export {
  getRubros,
  getCategories,
  getCategoriesByRubro,
  getCategoriasPage,
} from "./catalog";
export { getReglamento } from "./reglamento";
export { getInscripcion } from "./inscripcion";
export { getFechasCierre } from "./fechas-cierre";
export { getTarifario } from "./tarifario";
export { getPremios } from "./premios";
export { getJurors } from "./jurors";
export { getSponsors } from "./sponsors";
