import { contacto } from "@/mocks";
import type { Contacto } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getContacto(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Contacto> {
  return contacto;
}
