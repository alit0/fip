/**
 * Typed entry point for all mock fixtures (Phase 2).
 * In Phase 3 these exports are swapped for Payload local-API queries — pages import
 * from here so the migration is a single-file change per entity.
 */
import type { HomeContent, Rubro, Juror, Sponsor, Reglamento } from "./types";

import homeData from "./home.json";
import rubrosData from "./rubros.json";
import jurorsData from "./jurors.json";
import sponsorsData from "./sponsors.json";
import reglamentoData from "./reglamento.json";

export const home: HomeContent = homeData;
export const rubros: Rubro[] = rubrosData;
export const jurors: Juror[] = jurorsData;
export const sponsors: Sponsor[] = sponsorsData;
export const reglamento: Reglamento = reglamentoData;

export type { HomeContent, Rubro, Juror, Sponsor, Reglamento } from "./types";
