import { inscripcion } from '../src/mocks'

type Language = 'es' | 'pt'
type TextRow = { text: string }
type LinkRow = { label: string; href: string }
type DownloadRow = { label: string; href: string; lang: 'ES' | 'PT' }

export type InscripcionGlobalSeedData = {
  title: string
  subtitle: string
  index: LinkRow[]
  steps: Array<{
    id: string
    step: string
    title: string
    body: TextRow[]
    bullets?: TextRow[]
    links?: LinkRow[]
    cta?: LinkRow
    downloads?: DownloadRow[]
    imageTodo?: string
  }>
  condiciones: { title: string; body: string }
  contenido: {
    id: string
    title: string
    question: string
    aspects: Array<{
      number: number
      title: string
      body: TextRow[]
    }>
  }
}

export type InscripcionSeedReport = {
  created: number
  skipped: number
  errors: number
}

export type SeedPayloadClient = {
  findGlobal: (args: {
    slug: 'inscripcion-global'
    locale: Language
    depth: number
  }) => Promise<unknown>
  updateGlobal: (args: {
    slug: 'inscripcion-global'
    locale: Language
    data: InscripcionGlobalSeedData
  }) => Promise<unknown>
}

function toTextRows(items: string[] | undefined): TextRow[] | undefined {
  return items?.map((text) => ({ text }))
}

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (!value || typeof value !== 'object') return false

  return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue)
}

export function isInscripcionGlobalSeeded(doc: unknown): boolean {
  if (!doc || typeof doc !== 'object') return false

  const record = doc as Partial<InscripcionGlobalSeedData>
  return hasMeaningfulValue({
    title: record.title,
    subtitle: record.subtitle,
    index: record.index,
    steps: record.steps,
    condiciones: record.condiciones,
    contenido: record.contenido,
  })
}

export const INSCRIPCION_GLOBAL_SEED: InscripcionGlobalSeedData = {
  title: inscripcion.title,
  subtitle: inscripcion.subtitle,
  index: inscripcion.index.map((item) => ({ label: item.label, href: item.href })),
  steps: inscripcion.steps.map((step) => ({
    id: step.id,
    step: step.step,
    title: step.title,
    body: toTextRows(step.body) ?? [],
    bullets: toTextRows(step.bullets),
    links: step.links?.map((link) => ({ label: link.text, href: link.href })),
    cta: step.cta ? { label: step.cta.label, href: step.cta.href } : undefined,
    downloads: step.downloads?.map((download) => ({
      label: download.label,
      href: download.href,
      lang: download.lang,
    })),
    imageTodo: step.imageTodo,
  })),
  condiciones: {
    title: inscripcion.condiciones.title,
    body: inscripcion.condiciones.body,
  },
  contenido: {
    id: inscripcion.contenido.id,
    title: inscripcion.contenido.title,
    question: inscripcion.contenido.question,
    aspects: inscripcion.contenido.aspects.map((aspect) => ({
      number: aspect.number,
      title: aspect.title,
      body: toTextRows(aspect.body) ?? [],
    })),
  },
}

export async function seedInscripcionGlobal(
  payload: SeedPayloadClient,
  data: InscripcionGlobalSeedData = INSCRIPCION_GLOBAL_SEED,
  onEvent: (message: string) => void = () => undefined,
): Promise<InscripcionSeedReport> {
  const report: InscripcionSeedReport = {
    created: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    const existing = await payload.findGlobal({
      slug: 'inscripcion-global',
      locale: 'es',
      depth: 0,
    })

    if (isInscripcionGlobalSeeded(existing)) {
      report.skipped++
      onEvent('  - Skipped existing InscripcionGlobal')
      return report
    }

    await payload.updateGlobal({
      slug: 'inscripcion-global',
      locale: 'es',
      data,
    })

    report.created++
    onEvent('  + Created InscripcionGlobal')
  } catch (err) {
    report.errors++
    onEvent(`  ✗ Error processing InscripcionGlobal: ${(err as Error).message}`)
  }

  return report
}
