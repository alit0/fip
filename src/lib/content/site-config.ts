import { siteConfig } from "@/mocks";
import type { SiteConfig } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

type LabeledValue = {
  label?: string | null;
  email?: string | null;
  number?: string | null;
};

type SocialLinkDoc = {
  name?: string | null;
  href?: string | null;
};

type SiteConfigDoc = {
  contactEmails?: LabeledValue[] | null;
  phones?: LabeledValue[] | null;
  whatsapps?: LabeledValue[] | null;
  address?: string | null;
  socialLinks?: SocialLinkDoc[] | null;
};

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

function firstValue<T extends LabeledValue>(
  items: T[] | null | undefined,
  key: "email" | "number",
): string | null {
  return items?.find((item) => item[key])?.[key] ?? null;
}

function mapSiteConfig(doc: SiteConfigDoc): SiteConfig {
  const social =
    doc.socialLinks
      ?.filter((link): link is { name: string; href: string } =>
        Boolean(link.name && link.href),
      )
      .map((link) => ({ name: link.name, href: link.href })) ?? [];

  return {
    contact: {
      address: doc.address || siteConfig.contact.address,
      whatsapp:
        firstValue(doc.whatsapps, "number") || siteConfig.contact.whatsapp,
      tel: firstValue(doc.phones, "number") || siteConfig.contact.tel,
      office: siteConfig.contact.office,
      email:
        firstValue(doc.contactEmails, "email") || siteConfig.contact.email,
    },
    social: social.length > 0 ? social : siteConfig.social,
    // Downloads remain backed by mock/static data until the footer switches to
    // getDownloadFiles(). SiteConfig keeps today's public contract intact.
    downloads: siteConfig.downloads,
  };
}

export async function getSiteConfig(
  locale: Locale = DEFAULT_LOCALE,
): Promise<SiteConfig> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const doc = (await payload.findGlobal({
        slug: "site-config",
        locale,
        depth: 1,
      })) as SiteConfigDoc;

      if (doc) {
        return mapSiteConfig(doc);
      }
    }
  } catch (e) {
    warnOnce(
      `[siteConfig] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return siteConfig;
}
