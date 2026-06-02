/**
 * Typed entry point for the raw mock fixtures (Phase 2).
 * Consumed ONLY by the async content layer (src/lib/content/*), which is what pages
 * and components import. In Phase 3 the content layer swaps these for Payload queries;
 * this barrel and the JSON files then go away.
 */
import type {
  HomeContent,
  Rubro,
  Juror,
  Sponsor,
  Reglamento,
  Category,
  CategoriasPage,
  SiteConfig,
  Inscripcion,
} from "./types";

import homeData from "./home.json";
import rubrosData from "./rubros.json";
import jurorsData from "./jurors.json";
import sponsorsData from "./sponsors.json";
import reglamentoData from "./reglamento.json";
import categoriesData from "./categories.json";
import categoriasData from "./categorias.json";
import siteConfigData from "./site-config.json";
import inscripcionData from "./inscripcion.json";

export const home: HomeContent = homeData;
export const rubros: Rubro[] = rubrosData;
export const jurors: Juror[] = jurorsData;
export const sponsors: Sponsor[] = sponsorsData;
export const reglamento: Reglamento = reglamentoData;
export const categories: Category[] = categoriesData as Category[];
export const categoriasPage: CategoriasPage = categoriasData;
export const siteConfig: SiteConfig = siteConfigData;
export const inscripcion: Inscripcion = inscripcionData as Inscripcion;

export type {
  HomeContent,
  Rubro,
  Juror,
  Sponsor,
  Reglamento,
  Category,
  CategoriasPage,
  SiteConfig,
  SocialLink,
  DownloadLink,
  AwardIcon,
  Inscripcion,
} from "./types";
