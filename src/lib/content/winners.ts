import { ganadores as mockGanadores } from "../../mocks";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "../payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export type WinnerEntry = {
  editionYear: number;
  rubroCode: string;
  rubroNumber: number;
  categoryCode: string;
  categoryTitle: string;
  awardLevel: string;
  specialAwardName?: string | null;
  campaign: string;
  brand?: string | null;
  agency: string;
  country: string;
  isGrandReco: boolean;
  order: number;
};

export async function getWinners(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<WinnerEntry[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "winners",
        sort: "order",
        limit: 2000,
        depth: 2, // Resolve edition, rubro, category
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc: any) => ({
          editionYear: typeof doc.edition === "object" ? doc.edition.year : 2026,
          rubroCode: typeof doc.rubro === "object" ? doc.rubro.code : "",
          rubroNumber: typeof doc.rubro === "object" ? doc.rubro.number : 0,
          categoryCode: typeof doc.category === "object" ? doc.category.code : "",
          categoryTitle:
            typeof doc.category === "object"
              ? doc.category.title || doc.category.name || ""
              : "",
          awardLevel: doc.awardLevel,
          specialAwardName: doc.specialAwardName || null,
          campaign: doc.campaign,
          brand: doc.brand || null,
          agency: doc.agency,
          country: doc.country,
          isGrandReco: doc.isGrandReco || false,
          order: doc.order || 0,
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[winners] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  // Fallback to mocks - this requires flattening the nested structure
  const flatWinners: WinnerEntry[] = [];

  for (const yearStr in mockGanadores) {
    const yearData = mockGanadores[yearStr];
    const year = parseInt(yearStr);

    // Flatten "grandes"
    for (const g of yearData.grandes || []) {
      flatWinners.push({
        editionYear: year,
        rubroCode: "GP",
        rubroNumber: 0,
        categoryCode: "",
        categoryTitle: g.premio,
        awardLevel: "especial",
        specialAwardName: g.premio,
        campaign: "",
        brand: "",
        agency: g.ganador,
        country: g.pais,
        isGrandReco: true,
        order: 0,
      });
    }

    // Flatten "rubros"
    for (const r of yearData.rubros || []) {
      // Parse rubro string: "RUBRO 1 • MARKETING PROMOCIONAL (MP)"
      const rubroMatch = r.rubro.match(/RUBRO\s+(\d+)\s*•?\s*.*?\(([^)]+)\)/i);
      const rubroNumber = rubroMatch ? parseInt(rubroMatch[1]) : 0;
      const rubroCode = rubroMatch ? rubroMatch[2] : "";

      for (const c of r.categorias || []) {
        for (const w of c.rows || []) {
          flatWinners.push({
            editionYear: year,
            rubroCode,
            rubroNumber,
            categoryCode: c.codigo,
            categoryTitle: c.nombre,
            awardLevel: (w.nivel as string).toLowerCase().replace(" ", ""),
            specialAwardName: null,
            campaign: w.campania,
            brand: w.marca || null,
            agency: w.agencia,
            country: w.pais,
            isGrandReco: false,
            order: 0,
          });
        }
      }
    }
  }

  return flatWinners;
}
