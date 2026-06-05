import { ganadores } from "@/mocks";
import type { GanadoresYear } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/** Winners for a given edition year. null if the year has no data. */
export async function getGanadores(
  year: number | string,
  _locale: Locale = DEFAULT_LOCALE,
): Promise<GanadoresYear | null> {
  return ganadores[String(year)] ?? null;
}
