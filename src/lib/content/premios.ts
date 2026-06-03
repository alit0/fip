import { premios } from "@/mocks";
import type { Premios } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getPremios(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Premios> {
  return premios;
}
