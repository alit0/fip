import { premios } from "@/mocks";
import type { Premios } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

type PremiosGlobalDoc = {
  title?: string | null;
  intro?: string | null;
  orderEmail?: string | null;
  priceNotice?: string | null;
  trophies?: Array<{
    name?: string | null;
    description?: string | null;
    price?: string | null;
    imageTodo?: string | null;
  } | null> | null;
  shipping?: {
    heading?: string | null;
    note?: string | null;
    rows?: Array<{
      label?: string | null;
      price?: string | null;
    } | null> | null;
  } | null;
  sections?: Array<{
    heading?: string | null;
    items?: Array<{
      title?: string | null;
      body?: string | null;
    } | null> | null;
  } | null> | null;
  downloads?: {
    esDownloadKey?: string | null;
    ptDownloadKey?: string | null;
  } | null;
};

type DownloadDoc = {
  label?: string | null;
  file?: { url?: string | null } | string | null;
  fileUrl?: string | null;
};

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

function compact<T>(items: Array<T | null | undefined> | null | undefined): T[] {
  return (items ?? []).filter((item): item is T => Boolean(item));
}

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (!value || typeof value !== "object") return false;

  return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue);
}

function isEmptyPremiosGlobal(doc: PremiosGlobalDoc | null | undefined): boolean {
  if (!doc) return true;
  return !hasMeaningfulValue({
    title: doc.title,
    intro: doc.intro,
    orderEmail: doc.orderEmail,
    priceNotice: doc.priceNotice,
    trophies: doc.trophies,
    shipping: doc.shipping,
    sections: doc.sections,
    downloads: doc.downloads,
  });
}

function mapTrophies(doc: PremiosGlobalDoc): Premios["trophies"] {
  const trophies = compact(doc.trophies)
    .filter((trophy) => trophy.name && trophy.description && trophy.price)
    .map((trophy) => ({
      name: trophy.name as string,
      description: trophy.description as string,
      price: trophy.price as string,
      imageTodo: trophy.imageTodo || "",
    }));

  return trophies.length > 0 ? trophies : premios.trophies;
}

function mapShipping(doc: PremiosGlobalDoc): Premios["shipping"] {
  const rows = compact(doc.shipping?.rows)
    .filter((row) => row.label && row.price)
    .map((row) => ({
      label: row.label as string,
      price: row.price as string,
    }));

  if (!doc.shipping?.heading || rows.length === 0) return premios.shipping;

  return {
    heading: doc.shipping.heading,
    note: doc.shipping.note || premios.shipping.note,
    rows,
  };
}

function mapSections(doc: PremiosGlobalDoc): Premios["sections"] {
  const sections = compact(doc.sections)
    .filter((section) => section.heading)
    .map((section) => ({
      heading: section.heading as string,
      items: compact(section.items)
        .filter((item) => item.title && item.body)
        .map((item) => ({
          title: item.title as string,
          body: item.body as string,
        })),
    }))
    .filter((section) => section.items.length > 0);

  return sections.length > 0 ? sections : premios.sections;
}

function mapDownloadDoc(
  doc: DownloadDoc | null | undefined,
  fallback: Premios["downloads"]["es" | "pt"],
): Premios["downloads"]["es" | "pt"] {
  if (!doc?.label) return fallback;

  const href =
    doc.file && typeof doc.file === "object" && doc.file.url
      ? doc.file.url
      : doc.fileUrl;

  if (!href) return fallback;

  return {
    label: doc.label,
    href,
  };
}

async function resolveDownload(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  downloadKey: string | null | undefined,
  language: "es" | "pt",
): Promise<Premios["downloads"]["es" | "pt"]> {
  const fallback = premios.downloads[language];
  if (!payload || !downloadKey) return fallback;

  const result = await payload.find({
    collection: "download-files",
    where: {
      and: [
        { active: { equals: true } },
        { key: { equals: downloadKey } },
        { language: { equals: language } },
      ],
    },
    limit: 1,
    depth: 1,
  });

  return mapDownloadDoc(result.docs[0] as DownloadDoc | undefined, fallback);
}

async function mapPremiosGlobal(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  doc: PremiosGlobalDoc,
): Promise<Premios> {
  const downloads = {
    es: await resolveDownload(payload, doc.downloads?.esDownloadKey, "es"),
    pt: await resolveDownload(payload, doc.downloads?.ptDownloadKey, "pt"),
  };

  return {
    title: doc.title || premios.title,
    intro: doc.intro || premios.intro,
    orderEmail: doc.orderEmail || premios.orderEmail,
    priceNotice: doc.priceNotice || premios.priceNotice,
    trophies: mapTrophies(doc),
    shipping: mapShipping(doc),
    sections: mapSections(doc),
    downloads,
  };
}

export async function getPremios(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Premios> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const doc = (await payload.findGlobal({
        slug: "premios-global",
        locale,
        depth: 0,
      })) as PremiosGlobalDoc;

      if (!isEmptyPremiosGlobal(doc)) {
        return mapPremiosGlobal(payload, doc);
      }
    }
  } catch (e) {
    warnOnce(
      `[premios] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return premios;
}
