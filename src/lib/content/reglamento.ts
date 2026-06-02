import { reglamento } from "@/mocks";
import type { Reglamento } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getReglamento(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Reglamento> {
  return reglamento;
}
