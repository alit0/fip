import { hallDeLaFama } from "@/mocks";
import type { HallDeLaFama } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getHallDeLaFama(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<HallDeLaFama> {
  return hallDeLaFama;
}
