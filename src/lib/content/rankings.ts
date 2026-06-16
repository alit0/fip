import { ranking as mockRanking } from "../../mocks";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "../payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export type RankingEntry = {
  country: string;
  countrySlug: string;
  year: number;
  position: number;
  agency: string;
  granPrix: number;
  oro: number;
  plata: number;
  bronce: number;
  total: number;
  order: number;
};

export async function getRankingEntries(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<RankingEntry[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "ranking-entries",
        sort: "order",
        limit: 1000,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc: any) => ({
          country: doc.country,
          countrySlug: doc.countrySlug,
          year: doc.year,
          position: doc.position,
          agency: doc.agency,
          granPrix: doc.granPrix || 0,
          oro: doc.oro || 0,
          plata: doc.plata || 0,
          bronce: doc.bronce || 0,
          total: doc.total || 0,
          order: doc.order || 0,
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[rankings] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  // Fallback to mocks
  const flatRankings: RankingEntry[] = [];
  const year = 2024; // Representative year

  for (const slug in mockRanking) {
    const countryData = mockRanking[slug];
    for (const row of countryData.rows) {
      const parseVal = (v: string) => (v === "-" ? 0 : parseInt(v) || 0);
      flatRankings.push({
        country: countryData.label,
        countrySlug: slug,
        year: year,
        position: parseInt(row.position) || 0,
        agency: row.agency,
        granPrix: parseVal(row.granPrix),
        oro: parseVal(row.oro),
        plata: parseVal(row.plata),
        bronce: parseVal(row.bronce),
        total: parseVal(row.total),
        order: parseInt(row.position) || 0,
      });
    }
  }

  return flatRankings;
}
