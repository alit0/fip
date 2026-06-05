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
  FechasCierre,
  Tarifario,
  Premios,
  JuradosByYear,
  HallDeLaFama,
  Contacto,
  RankingByCountry,
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
import fechasCierreData from "./fechas-cierre.json";
import tarifarioData from "./tarifario.json";
import premiosData from "./premios.json";
import juradosData from "./jurados.json";
import hallData from "./hall-de-la-fama.json";
import contactoData from "./contacto.json";
import rankingData from "./ranking.json";

export const home: HomeContent = homeData;
export const rubros: Rubro[] = rubrosData;
export const jurors: Juror[] = jurorsData;
export const sponsors: Sponsor[] = sponsorsData;
export const reglamento: Reglamento = reglamentoData;
export const categories: Category[] = categoriesData as Category[];
export const categoriasPage: CategoriasPage = categoriasData;
export const siteConfig: SiteConfig = siteConfigData;
export const inscripcion: Inscripcion = inscripcionData as Inscripcion;
export const fechasCierre: FechasCierre = fechasCierreData;
export const tarifario: Tarifario = tarifarioData;
export const premios: Premios = premiosData;
export const jurados: JuradosByYear = juradosData;
export const hallDeLaFama: HallDeLaFama = hallData;
export const contacto: Contacto = contactoData;
export const ranking: RankingByCountry = rankingData;

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
  FechasCierre,
  Tarifario,
  Premios,
  JuradoYearEntry,
  JuradosByYear,
  HallMember,
  HallDeLaFama,
  ContactPerson,
  ContactEmail,
  Contacto,
  RankingRow,
  RankingCountry,
  RankingByCountry,
} from "./types";
