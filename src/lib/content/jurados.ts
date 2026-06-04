import { jurados } from "@/mocks";
import type { JuradoYearEntry } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/** Jurors for a given edition year. Empty array if the year has no data. */
export async function getJurados(
  year: number | string,
  _locale: Locale = DEFAULT_LOCALE,
): Promise<JuradoYearEntry[]> {
  return jurados[String(year)] ?? [];
}
