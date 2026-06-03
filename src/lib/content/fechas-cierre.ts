import { fechasCierre } from "@/mocks";
import type { FechasCierre } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getFechasCierre(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<FechasCierre> {
  return fechasCierre;
}
