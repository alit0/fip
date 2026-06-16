import { hallDeLaFama } from "@/mocks";
import type { HallMember } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export async function getHallOfFameMembers(
  locale: Locale = DEFAULT_LOCALE,
): Promise<HallMember[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "hall-of-fame-members",
        where: { active: { equals: true } },
        sort: "order",
        limit: 100,
        locale,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc) => {
          const d = doc as Record<string, unknown>;
          return {
            slug: d.slug as string,
            name: d.name as string,
            role: (d.role as string) || "",
            company: (d.company as string) || "",
            country: d.country as string,
            countryCode: (d.countryCode as string) || null,
            photoUrl: null, // TODO: resolve from photo upload relation when assets exist
            logoTodo: null, // TODO: resolve from logo upload relation when assets exist
            bioText: (d.bio as string) || "",
            bioImageTodo: null, // Not stored in Payload; legacy mock field
            order: (d.order as number) || 0,
          };
        });
      }
    }
  } catch (e) {
    warnOnce(
      `[hall-of-fame-members] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return hallDeLaFama.members;
}
