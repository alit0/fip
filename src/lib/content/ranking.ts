import { ranking } from "@/mocks";
import type { RankingCountry } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/** Ranking for a given country slug. null if the slug has no data. */
export async function getRanking(
  country: string,
  _locale: Locale = DEFAULT_LOCALE,
): Promise<RankingCountry | null> {
  return ranking[country] ?? null;
}
