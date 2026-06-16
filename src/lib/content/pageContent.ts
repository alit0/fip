import { home } from "@/mocks";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

export type PageContentEntry = {
  pageKey: string;
  sectionKey: string;
  title: string;
  body: string;
  imageUrl: string | null;
  order: number;
  active: boolean;
};

type PageContentDoc = {
  pageKey?: string | null;
  sectionKey?: string | null;
  title?: string | null;
  body?: unknown;
  image?: string | { url?: string | null } | null;
  order?: number | null;
  active?: boolean | null;
};

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

function getNodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";

  const record = node as Record<string, unknown>;
  if (typeof record.text === "string") {
    return record.text;
  }

  if (Array.isArray(record.children)) {
    return record.children.map(getNodeText).join("");
  }

  return "";
}

export function richTextToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!Array.isArray(root?.children)) return "";

  return root.children
    .map(getNodeText)
    .map((text) => text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function getFallbackPageContent(pageKey = "home"): PageContentEntry[] {
  if (pageKey !== "home") return [];

  const intro: PageContentEntry = {
    pageKey: "home",
    sectionKey: "institutional-intro",
    title: home.institutional.heading,
    body: home.institutional.intro.join("\n\n"),
    imageUrl: null,
    order: 0,
    active: true,
  };

  const sections = home.institutional.sections.map((section, index) => ({
    pageKey: "home",
    sectionKey: `institutional-section-${index + 1}`,
    title: section.title,
    body: section.body,
    imageUrl: null,
    order: index + 1,
    active: true,
  }));

  return [intro, ...sections];
}

function mapPageContentDoc(doc: PageContentDoc): PageContentEntry {
  return {
    pageKey: doc.pageKey || "",
    sectionKey: doc.sectionKey || "",
    title: doc.title || "",
    body: richTextToString(doc.body),
    imageUrl:
      doc.image && typeof doc.image === "object" ? doc.image.url || null : null,
    order: doc.order ?? 0,
    active: doc.active ?? true,
  };
}

export async function getPageContent(
  pageKey = "home",
  locale: Locale = DEFAULT_LOCALE,
): Promise<PageContentEntry[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "page-content",
        where: {
          and: [
            { active: { equals: true } },
            { pageKey: { equals: pageKey } },
          ],
        },
        sort: "order",
        limit: 100,
        locale,
        depth: 1,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc) =>
          mapPageContentDoc(doc as PageContentDoc),
        );
      }
    }
  } catch (e) {
    warnOnce(
      `[pageContent] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return getFallbackPageContent(pageKey);
}
