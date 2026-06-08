import { jurors as mockJurors } from "@/mocks";
import type { Juror } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export async function getJurors(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<Juror[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "jurors",
        where: { active: { equals: true } },
        sort: "order",
        limit: 100,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc) => ({
          slug: ((doc as Record<string, unknown>).name as string)
            .toLowerCase()
            .replace(/\s+/g, "-"),
          name: (doc as Record<string, unknown>).name as string,
          country: ((doc as Record<string, unknown>).country as string) || "",
          role: ((doc as Record<string, unknown>).role as string) || null,
          agency: ((doc as Record<string, unknown>).agency as string) || null,
          photoUrl: null, // TODO: resolve from photo upload relation when assets exist
        }));
      }
    }
  } catch (e) {
    warnOnce(
      `[jurors] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return mockJurors;
}
