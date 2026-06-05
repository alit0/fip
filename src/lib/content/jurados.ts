import { jurados } from "@/mocks";
import type { JuradoYearEntry } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

const REGIONAL_INDICATOR_A = 0x1f1e6;

function countryFlagToCode(countryFlag: string): string | null {
  const indicators = Array.from(countryFlag.trim());
  if (indicators.length !== 2) return null;

  const code = indicators
    .map((indicator) => indicator.codePointAt(0))
    .map((codePoint) => {
      if (!codePoint) return null;
      const letterIndex = codePoint - REGIONAL_INDICATOR_A;
      if (letterIndex < 0 || letterIndex > 25) return null;
      return String.fromCharCode(65 + letterIndex);
    });

  if (code.some((letter) => letter === null)) return null;
  return code.join("");
}

/** Jurors for a given edition year. Empty array if the year has no data. */
export async function getJurados(
  year: number | string,
  _locale: Locale = DEFAULT_LOCALE,
): Promise<JuradoYearEntry[]> {
  return (jurados[String(year)] ?? []).map((jurado) => ({
    ...jurado,
    countryCode: countryFlagToCode(jurado.countryFlag),
  }));
}
