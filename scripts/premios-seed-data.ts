import { premios } from '../src/mocks'

type Language = 'es' | 'pt'

export type PremiosGlobalSeedData = {
  title: string
  intro: string
  orderEmail: string
  priceNotice: string
  trophies: Array<{
    name: string
    description: string
    price: string
    imageTodo?: string
  }>
  shipping: {
    heading: string
    note: string
    rows: Array<{
      label: string
      price: string
    }>
  }
  sections: Array<{
    heading: string
    items: Array<{
      title: string
      body: string
    }>
  }>
  downloads: {
    esDownloadKey: string
    ptDownloadKey: string
  }
}

export type PremiosSeedReport = {
  created: number
  skipped: number
  errors: number
}

export type SeedPayloadClient = {
  findGlobal: (args: {
    slug: 'premios-global'
    locale: Language
    depth: number
  }) => Promise<unknown>
  updateGlobal: (args: {
    slug: 'premios-global'
    locale: Language
    data: PremiosGlobalSeedData
  }) => Promise<unknown>
}

function normalizeDownloadKey(href: string): string {
  const key = href.split('/').pop()?.split('.')[0] || 'replicas-orden-de-compra'

  if (key === 'Replicas-Orden_de_Compra_port') return 'replicas_Orden_de_Compra'

  return key
}

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (!value || typeof value !== 'object') return false

  return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue)
}

export function isPremiosGlobalSeeded(doc: unknown): boolean {
  if (!doc || typeof doc !== 'object') return false

  const record = doc as Partial<PremiosGlobalSeedData>
  return hasMeaningfulValue({
    title: record.title,
    intro: record.intro,
    orderEmail: record.orderEmail,
    priceNotice: record.priceNotice,
    trophies: record.trophies,
    shipping: record.shipping,
    sections: record.sections,
    downloads: record.downloads,
  })
}

export const PREMIOS_GLOBAL_SEED: PremiosGlobalSeedData = {
  title: premios.title,
  intro: premios.intro,
  orderEmail: premios.orderEmail,
  priceNotice: premios.priceNotice,
  trophies: premios.trophies.map((trophy) => ({
    name: trophy.name,
    description: trophy.description,
    price: trophy.price,
    imageTodo: trophy.imageTodo,
  })),
  shipping: {
    heading: premios.shipping.heading,
    note: premios.shipping.note,
    rows: premios.shipping.rows.map((row) => ({
      label: row.label,
      price: row.price,
    })),
  },
  sections: premios.sections.map((section) => ({
    heading: section.heading,
    items: section.items.map((item) => ({
      title: item.title,
      body: item.body,
    })),
  })),
  downloads: {
    esDownloadKey: normalizeDownloadKey(premios.downloads.es.href),
    ptDownloadKey: normalizeDownloadKey(premios.downloads.pt.href),
  },
}

export async function seedPremiosGlobal(
  payload: SeedPayloadClient,
  data: PremiosGlobalSeedData = PREMIOS_GLOBAL_SEED,
  onEvent: (message: string) => void = () => undefined,
): Promise<PremiosSeedReport> {
  const report: PremiosSeedReport = {
    created: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    const existing = await payload.findGlobal({
      slug: 'premios-global',
      locale: 'es',
      depth: 0,
    })

    if (isPremiosGlobalSeeded(existing)) {
      report.skipped++
      onEvent('  - Skipped existing PremiosGlobal')
      return report
    }

    await payload.updateGlobal({
      slug: 'premios-global',
      locale: 'es',
      data,
    })

    report.created++
    onEvent('  + Created PremiosGlobal')
  } catch (err) {
    report.errors++
    onEvent(`  ✗ Error processing PremiosGlobal: ${(err as Error).message}`)
  }

  return report
}
