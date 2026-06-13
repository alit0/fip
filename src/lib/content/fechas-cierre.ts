import { fechasCierre } from "@/mocks";
import type { FechasCierre } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

type ClosingDocRow = {
  label?: string | null;
  detail?: string | null;
  date?: string | null;
};

type FechasGlobalDoc = {
  title?: string | null;
  intro?: string | null;
  discounts?: {
    heading?: string | null;
    rows?: Array<{
      descuento?: string | null;
      tipo?: string | null;
      condicion?: string | null;
      vigencia?: string | null;
    } | null> | null;
  } | null;
  closings?: {
    heading?: string | null;
    regions?: Array<ClosingDocRow | null> | null;
    milestones?: Array<ClosingDocRow | null> | null;
    note?: string | null;
  } | null;
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

function isEmptyFechasGlobal(doc: FechasGlobalDoc | null | undefined): boolean {
  if (!doc) return true;
  return !hasMeaningfulValue({
    title: doc.title,
    intro: doc.intro,
    discounts: doc.discounts,
    closings: doc.closings,
  });
}

function mapDiscounts(doc: FechasGlobalDoc): FechasCierre["discounts"] {
  const rows = compact(doc.discounts?.rows)
    .filter((row) => row.descuento && row.tipo && row.condicion && row.vigencia)
    .map((row) => ({
      descuento: row.descuento as string,
      tipo: row.tipo as string,
      condicion: row.condicion as string,
      vigencia: row.vigencia as string,
    }));

  if (!doc.discounts?.heading || rows.length === 0) return fechasCierre.discounts;

  return {
    heading: doc.discounts.heading,
    rows,
  };
}

function mapClosingRows(
  rows: Array<ClosingDocRow | null> | null | undefined,
  fallback: FechasCierre["closings"]["regions"],
): FechasCierre["closings"]["regions"] {
  const mapped = compact(rows)
    .filter((row) => row.label && row.detail && row.date)
    .map((row) => ({
      label: row.label as string,
      detail: row.detail as string,
      date: row.date as string,
    }));

  return mapped.length > 0 ? mapped : fallback;
}


function mapClosings(doc: FechasGlobalDoc): FechasCierre["closings"] {
  if (!doc.closings?.heading) return fechasCierre.closings;

  return {
    heading: doc.closings.heading,
    regions: mapClosingRows(doc.closings.regions, fechasCierre.closings.regions),
    milestones: mapClosingRows(doc.closings.milestones, fechasCierre.closings.milestones),
    note: doc.closings.note || fechasCierre.closings.note,
  };
}

function mapFechasGlobal(doc: FechasGlobalDoc): FechasCierre {
  return {
    title: doc.title || fechasCierre.title,
    intro: doc.intro || fechasCierre.intro,
    discounts: mapDiscounts(doc),
    closings: mapClosings(doc),
  };
}

export async function getFechasCierre(
  locale: Locale = DEFAULT_LOCALE,
): Promise<FechasCierre> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const doc = (await payload.findGlobal({
        slug: "fechas-global",
        locale,
        depth: 0,
      })) as FechasGlobalDoc;

      if (!isEmptyFechasGlobal(doc)) {
        return mapFechasGlobal(doc);
      }
    }
  } catch (e) {
    warnOnce(
      `[fechas-cierre] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return fechasCierre;
}
