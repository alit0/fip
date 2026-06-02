import { sponsors } from "@/mocks";
import type { Sponsor } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getSponsors(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Sponsor[]> {
  return sponsors;
}
