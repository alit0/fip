import { inscripcion } from "@/mocks";
import type { Inscripcion } from "@/mocks/types";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "@/lib/payload";

type TextRow = { text?: string | null } | string;
type LinkRow = { label?: string | null; text?: string | null; href?: string | null };
type DownloadRow = { label?: string | null; href?: string | null; lang?: "ES" | "PT" | null };

type InscripcionGlobalDoc = {
  title?: string | null;
  subtitle?: string | null;
  index?: Array<LinkRow | null> | null;
  steps?: Array<{
    id?: string | null;
    step?: string | null;
    title?: string | null;
    body?: Array<TextRow | null> | null;
    bullets?: Array<TextRow | null> | null;
    links?: Array<LinkRow | null> | null;
    cta?: LinkRow | null;
    downloads?: Array<DownloadRow | null> | null;
    imageTodo?: string | null;
  } | null> | null;
  condiciones?: {
    title?: string | null;
    body?: string | null;
  } | null;
  contenido?: {
    id?: string | null;
    title?: string | null;
    question?: string | null;
    aspects?: Array<{
      number?: number | null;
      title?: string | null;
      body?: Array<TextRow | null> | null;
    } | null> | null;
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

function isEmptyInscripcionGlobal(doc: InscripcionGlobalDoc | null | undefined): boolean {
  if (!doc) return true;
  return !hasMeaningfulValue({
    title: doc.title,
    subtitle: doc.subtitle,
    index: doc.index,
    steps: doc.steps,
    condiciones: doc.condiciones,
    contenido: doc.contenido,
  });
}

function textValue(row: TextRow | null | undefined): string | null {
  if (typeof row === "string") return row.trim() ? row : null;
  if (row?.text?.trim()) return row.text;
  return null;
}

function mapTextRows(rows: Array<TextRow | null> | null | undefined): string[] {
  return compact(rows).map(textValue).filter((value): value is string => Boolean(value));
}

function mapLinks(rows: Array<LinkRow | null> | null | undefined): Array<{ text: string; href: string }> {
  return compact(rows)
    .filter((row) => (row.text || row.label) && row.href)
    .map((row) => ({
      text: (row.text || row.label) as string,
      href: row.href as string,
    }));
}

function mapIndex(rows: Array<LinkRow | null> | null | undefined): Inscripcion["index"] {
  const mapped = compact(rows)
    .filter((row) => (row.label || row.text) && row.href)
    .map((row) => ({
      label: (row.label || row.text) as string,
      href: row.href as string,
    }));

  return mapped.length > 0 ? mapped : inscripcion.index;
}

function mapDownloads(rows: Array<DownloadRow | null> | null | undefined): NonNullable<Inscripcion["steps"][number]["downloads"]> | undefined {
  const mapped = compact(rows)
    .filter((row) => row.label && row.href && row.lang)
    .map((row) => ({
      label: row.label as string,
      href: row.href as string,
      lang: row.lang as "ES" | "PT",
    }));

  return mapped.length > 0 ? mapped : undefined;
}

function mapCta(cta: LinkRow | null | undefined): Inscripcion["steps"][number]["cta"] {
  if (!cta?.href || !(cta.label || cta.text)) return undefined;

  return {
    label: (cta.label || cta.text) as string,
    href: cta.href,
  };
}

function mapSteps(doc: InscripcionGlobalDoc): Inscripcion["steps"] {
  const steps = compact(doc.steps)
    .filter((step) => step.id && step.step && step.title)
    .map((step) => {
      const mapped = {
        id: step.id as string,
        step: step.step as string,
        title: step.title as string,
        body: mapTextRows(step.body),
        bullets: mapTextRows(step.bullets),
        links: mapLinks(step.links),
        cta: mapCta(step.cta),
        downloads: mapDownloads(step.downloads),
        imageTodo: step.imageTodo || undefined,
      };

      return {
        id: mapped.id,
        step: mapped.step,
        title: mapped.title,
        body: mapped.body.length > 0 ? mapped.body : [],
        ...(mapped.bullets.length > 0 ? { bullets: mapped.bullets } : {}),
        ...(mapped.links.length > 0 ? { links: mapped.links } : {}),
        ...(mapped.cta ? { cta: mapped.cta } : {}),
        ...(mapped.downloads ? { downloads: mapped.downloads } : {}),
        ...(mapped.imageTodo ? { imageTodo: mapped.imageTodo } : {}),
      };
    })
    .filter((step) => step.body.length > 0);

  return steps.length > 0 ? steps : inscripcion.steps;
}

function mapCondiciones(doc: InscripcionGlobalDoc): Inscripcion["condiciones"] {
  if (!doc.condiciones?.title || !doc.condiciones.body) return inscripcion.condiciones;

  return {
    title: doc.condiciones.title,
    body: doc.condiciones.body,
  };
}

function mapContenido(doc: InscripcionGlobalDoc): Inscripcion["contenido"] {
  const aspects = compact(doc.contenido?.aspects)
    .filter((aspect) => aspect.number && aspect.title)
    .map((aspect) => ({
      number: aspect.number as number,
      title: aspect.title as string,
      body: mapTextRows(aspect.body),
    }))
    .filter((aspect) => aspect.body.length > 0);

  if (!doc.contenido?.id || !doc.contenido.title || !doc.contenido.question || aspects.length === 0) {
    return inscripcion.contenido;
  }

  return {
    id: doc.contenido.id,
    title: doc.contenido.title,
    question: doc.contenido.question,
    aspects,
  };
}

function mapInscripcionGlobal(doc: InscripcionGlobalDoc): Inscripcion {
  return {
    title: doc.title || inscripcion.title,
    subtitle: doc.subtitle || inscripcion.subtitle,
    index: mapIndex(doc.index),
    steps: mapSteps(doc),
    condiciones: mapCondiciones(doc),
    contenido: mapContenido(doc),
  };
}

export async function getInscripcion(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Inscripcion> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const doc = (await payload.findGlobal({
        slug: "inscripcion-global",
        locale,
        depth: 0,
      })) as InscripcionGlobalDoc;

      if (!isEmptyInscripcionGlobal(doc)) {
        return mapInscripcionGlobal(doc);
      }
    }
  } catch (e) {
    warnOnce(
      `[inscripcion] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  return inscripcion;
}
