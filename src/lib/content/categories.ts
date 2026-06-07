import { categories as mockCategories, rubros as mockRubros } from "../../mocks";
import type { AwardIcon } from "../../mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "../payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export type CategoryEntry = {
  code: string;
  title: string;
  description: string | null;
  award: AwardIcon;
  isSpecial: boolean;
  specialType: string | null;
  isNew: boolean;
  order: number;
  rubroCode: string;
  rubroNumber: number;
  editionYear: number;
};

export async function getCategories(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<CategoryEntry[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "categories",
        sort: "order",
        limit: 1000,
        depth: 2, // Resolve rubro and edition
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc: any) => ({
          code: doc.code,
          title: doc.title,
          description: doc.description || null,
          award: (doc.awardIcon as AwardIcon) || "oro",
          isSpecial: doc.isSpecial || false,
          specialType: doc.specialType || null,
          isNew: doc.isNew || false,
          order: doc.order,
          rubroCode: typeof doc.rubro === "object" ? doc.rubro.code : "",
          rubroNumber: typeof doc.rubro === "object" ? doc.rubro.number : 0,
          editionYear: typeof doc.edition === "object" ? doc.edition.year : 2026,
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[categories] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  // Fallback to mocks
  const rubroMap = new Map(mockRubros.map((r) => [r.number, r.code]));

  return mockCategories.map((c) => ({
    code: c.code,
    title: c.title || "",
    description: c.description || null,
    award: c.award || "oro",
    isSpecial: c.isSpecial || false,
    specialType: c.specialType || null,
    isNew: c.isNew || false,
    order: 0,
    rubroCode: rubroMap.get(c.rubroNumber) || "",
    rubroNumber: c.rubroNumber,
    editionYear: 2026,
  }));
}
