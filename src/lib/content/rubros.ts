import { rubros as mockRubros } from "../../mocks";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "../payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export type RubroEntry = {
  number: number;
  code: string;
  name: string;
  description?: string | null;
  order: number;
  editionYear: number;
  /** anchor target on the Categorías page, e.g. /categorias#rubro-1 */
  href: string;
};

export async function getRubros(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<RubroEntry[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "rubros",
        sort: "order",
        limit: 100,
        depth: 1,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc: any) => ({
          number: doc.number,
          code: doc.code,
          name: doc.name,
          description: doc.description || null,
          order: doc.order,
          editionYear: typeof doc.edition === "object" ? doc.edition.year : 2026,
          href: `/categorias#rubro-${doc.number}`,
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[rubros] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return mockRubros.map((r) => ({
    number: r.number,
    code: r.code,
    name: r.name,
    description: null,
    order: r.number,
    editionYear: 2026,
    href: r.href,
  }));
}
