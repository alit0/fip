import { rubros, categories, categoriasPage } from "@/mocks";
import type { Rubro, Category, CategoriasPage } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

export async function getRubros(_locale: Locale = DEFAULT_LOCALE): Promise<Rubro[]> {
  return rubros;
}

export async function getCategories(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Category[]> {
  return categories;
}

/**
 * Categories grouped by rubro number. Moves the grouping out of the page
 * (was an O(n²) filter inside the render loop) into a single O(n) pass.
 */
export async function getCategoriesByRubro(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Map<number, Category[]>> {
  const byRubro = new Map<number, Category[]>();
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
