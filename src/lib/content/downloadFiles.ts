import { siteConfig } from "../../mocks";
import { type Locale, DEFAULT_LOCALE } from "./locale";
import { getPayloadClient } from "../payload";

let fallbackWarned = false;

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === "test") return;
  if (fallbackWarned) return;
  fallbackWarned = true;
  console.warn(msg);
}

export type DownloadFileFormat = 'pdf' | 'pptx' | 'docx';

export type DownloadFile = {
  key: string;
  label: string;
  language: 'es' | 'pt';
  format: DownloadFileFormat;
  fileUrl: string;
  section: string;
  order: number;
  active: boolean;
};

export async function getDownloadFiles(
  locale: Locale = DEFAULT_LOCALE,
): Promise<DownloadFile[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      // Query only the files for the requested locale first.
      const result = await payload.find({
        collection: "download-files",
        where: {
          and: [
            { active: { equals: true } },
            { language: { equals: locale } },
          ],
        },
        sort: "section,order",
        limit: 1000,
      });

      if (result.docs.length > 0) {
        return result.docs.map((doc: any) => ({
          key: doc.key,
          label: doc.label,
          language: doc.language,
          format: doc.format as DownloadFileFormat,
          fileUrl: (doc.file && doc.file.url) ? doc.file.url : doc.fileUrl,
          section: doc.section,
          order: doc.order || 0,
          active: doc.active,
        }));
      }

      // Payload has docs but none for this locale — try ES as fallback.
      if (locale !== DEFAULT_LOCALE) {
        const fallbackResult = await payload.find({
          collection: "download-files",
          where: {
            and: [
              { active: { equals: true } },
              { language: { equals: DEFAULT_LOCALE } },
            ],
          },
          sort: "section,order",
          limit: 1000,
        });

        if (fallbackResult.docs.length > 0) {
          return fallbackResult.docs.map((doc: any) => ({
            key: doc.key,
            label: doc.label,
            language: doc.language,
            format: doc.format as DownloadFileFormat,
            fileUrl: (doc.file && doc.file.url) ? doc.file.url : doc.fileUrl,
            section: doc.section,
            order: doc.order || 0,
            active: doc.active,
          }));
        }
      }
    }
  } catch (e) {
    warnOnce(
      `[downloadFiles] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  // Fallback to mocks — return files matching the requested locale.
  // If no PT mock files exist, fall back to ES (mirrors Payload's fallback: true).
  const mockSource = locale === 'pt' ? siteConfig.downloads.pt : siteConfig.downloads.es;
  const effectiveLocale: Locale =
    locale === 'pt' && mockSource.length === 0 ? 'es' : locale;
  const effectiveSource =
    effectiveLocale === 'pt' ? siteConfig.downloads.pt : siteConfig.downloads.es;

  const flatDownloads: DownloadFile[] = [];
  let order = 0;

  for (const item of effectiveSource) {
    const format = item.href.split('.').pop() as DownloadFileFormat;
    let key = item.href.split('/').pop()?.split('.')[0] || `download-${effectiveLocale}-${order}`;
    // Normalise PT key suffixes to match ES keys stored in the DB.
    if (key.endsWith('_port')) key = key.replace(/_port$/, '');
    if (key === 'tarifario-port__feb2026') key = 'tarifario_feb2026';
    if (key === 'Replicas-Orden_de_Compra_port') key = 'replicas_Orden_de_Compra';
    if (key === 'regulamento') key = 'reglamento';
    if (key === 'inscricao_autocompletable') key = 'inscripcion_autocompletable';
    if (key === 'fip_apresentacao_campanas') key = 'fip_presentacion_campanas';

    flatDownloads.push({
      key,
      label: item.label,
      language: effectiveLocale,
      format,
      fileUrl: item.href,
      section: 'footer',
      order: order++,
      active: true,
    });
  }

  return flatDownloads.sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    return a.order - b.order;
  });
}
