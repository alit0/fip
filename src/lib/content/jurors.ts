import { jurors } from "@/mocks";
import type { Juror } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/** Highlighted jurors for the current edition (2026 in the mock). */
export async function getJurors(_locale: Locale = DEFAULT_LOCALE): Promise<Juror[]> {
  return jurors;
}
