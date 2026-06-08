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
  _locale: Locale = DEFAULT_LOCALE,
): Promise<DownloadFile[]> {
  try {
    const payload = await getPayloadClient();
    if (payload) {
      const result = await payload.find({
        collection: "download-files",
        where: { active: { equals: true } },
        sort: "section,language,order",
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
    }
  } catch (e) {
    warnOnce(
      `[downloadFiles] query failed, using mock fallback: ${(e as Error).message}`,
    );
  }

  // Fallback to mocks
  const flatDownloads: DownloadFile[] = [];
  let orderEs = 0;
  for (const item of siteConfig.downloads.es) {
    const format = item.href.split('.').pop() as DownloadFileFormat;
    let key = item.href.split('/').pop()?.split('.')[0] || `download-es-${orderEs}`;
    if (key.endsWith('_port')) key = key.replace('_port', '');
    
    flatDownloads.push({
      key,
      label: item.label,
      language: 'es',
      format,
      fileUrl: item.href,
      section: 'footer',
      order: orderEs++,
      active: true,
    });
  }

  let orderPt = 0;
  for (const item of siteConfig.downloads.pt) {
    const format = item.href.split('.').pop() as DownloadFileFormat;
    let key = item.href.split('/').pop()?.split('.')[0] || `download-pt-${orderPt}`;
    if (key.endsWith('_port')) key = key.replace('_port', '');
    if (key === 'tarifario-port__feb2026') key = 'tarifario_feb2026';
    if (key === 'Replicas-Orden_de_Compra_port') key = 'replicas_Orden_de_Compra';
    if (key === 'regulamento') key = 'reglamento';
    if (key === 'inscricao_autocompletable') key = 'inscripcion_autocompletable';
    if (key === 'categorias') key = 'categorias';
    if (key === 'fip_apresentacao_campanas') key = 'fip_presentacion_campanas';
    
    flatDownloads.push({
      key,
      label: item.label,
      language: 'pt',
      format,
      fileUrl: item.href,
      section: 'footer',
      order: orderPt++,
      active: true,
    });
  }

  return flatDownloads.sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    if (a.language !== b.language) return a.language.localeCompare(b.language);
    return a.order - b.order;
  });
}
