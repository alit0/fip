import { sponsors as mockSponsors } from "@/mocks";
import type { Sponsor } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export async function getSponsors(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Sponsor[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "sponsors",
        where: { active: { equals: true } },
        sort: "order",
        limit: 100,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc) => ({
          name: (doc as Record<string, unknown>).name as string,
          logoUrl: null, // TODO: resolve from logo upload relation when assets exist
          url: ((doc as Record<string, unknown>).url as string) || null,
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[sponsors] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return mockSponsors;
}
