import { categoriasPage } from "@/mocks";
import { getCategories, type CategoryEntry } from "./categories";
import type { CategoriasPage } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/**
 * Categories grouped by rubro number. Moves the grouping out of the page
 * (was an O(n²) filter inside the render loop) into a single O(n) pass.
 */
export async function getCategoriesByRubro(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Map<number, CategoryEntry[]>> {
  const categories = await getCategories(locale);
  const byRubro = new Map<number, CategoryEntry[]>();
  for (const category of categories) {
    const list = byRubro.get(category.rubroNumber);
    if (list) list.push(category);
    else byRubro.set(category.rubroNumber, [category]);
  }
  return byRubro;
}

export async function getCategoriasPage(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<CategoriasPage> {
  return categoriasPage;
}
