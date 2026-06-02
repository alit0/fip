import { home } from "@/mocks";
import type { HomeContent } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getHomeContent(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<HomeContent> {
  return home;
}
