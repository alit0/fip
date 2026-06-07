import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

export type EditionStatus = "draft" | "active" | "closed";

export interface CurrentEdition {
  year: number;
  isCurrent: boolean;
  title: string;
  status: EditionStatus | null;
}

const DEFAULT_EDITION: CurrentEdition = {
  year: 2026,
  isCurrent: true,
  title: "FIP Festival 2026",
  status: "active",
};

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export async function getCurrentEdition(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<CurrentEdition> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "editions",
        where: { isCurrent: { equals: true } },
        limit: 1,
      });

      if (result.docs.length > 0) {
        const doc = result.docs[0] as Record<string, unknown>;
        const year = doc.year as number;
        return {
          year,
          isCurrent: (doc.isCurrent as boolean) ?? true,
          title: (doc.title as string) || `FIP Festival ${year}`,
          status: (doc.status as EditionStatus) ?? null,
        };
      }
    }
  } catch (e) {
    warnOnce(
      `[edition] query failed, using default fallback: ${(e as Error).message}`,
    );
  }

  return DEFAULT_EDITION;
}
