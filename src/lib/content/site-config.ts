import { siteConfig } from "@/mocks";
import type { SiteConfig } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";

/** Contact, social links and downloads. Phase 3: Payload SiteConfig global. */
export async function getSiteConfig(
  _locale: Locale = DEFAULT_LOCALE,
): Promise<SiteConfig> {
  return siteConfig;
}
