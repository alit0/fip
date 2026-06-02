import { inscripcion } from "@/mocks";
import type { Inscripcion } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getInscripcion(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Inscripcion> {
  return inscripcion;
}
