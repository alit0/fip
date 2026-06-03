import { tarifario } from "@/mocks";
import type { Tarifario } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getTarifario(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Tarifario> {
  return tarifario;
}
