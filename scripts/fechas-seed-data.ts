import { fechasCierre } from '../src/mocks'

type Language = 'es' | 'pt'

export type FechasGlobalSeedData = {
  title: string
  intro: string
  discounts: {
    heading: string
    rows: Array<{
      descuento: string
      tipo: string
      condicion: string
      vigencia: string
    }>
  }
  closings: {
    heading: string
    regions: Array<{
      label: string
      detail: string
      date: string
    }>
    milestones: Array<{
      label: string
      detail: string
      date: string
    }>
    note: string
  }
}

export type FechasSeedReport = {
  created: number
  skipped: number
  errors: number
}

export type SeedPayloadClient = {
  findGlobal: (args: {
    slug: 'fechas-global'
    locale: Language
    depth: number
  }) => Promise<unknown>
  updateGlobal: (args: {
    slug: 'fechas-global'
    locale: Language
    data: FechasGlobalSeedData
  }) => Promise<unknown>
}

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (!value || typeof value !== 'object') return false

  return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue)
}

export function isFechasGlobalSeeded(doc: unknown): boolean {
  if (!doc || typeof doc !== 'object') return false

  const record = doc as Partial<FechasGlobalSeedData>
  return hasMeaningfulValue({
    title: record.title,
    intro: record.intro,
    discounts: record.discounts,
    closings: record.closings,
  })
}

export const FECHAS_GLOBAL_SEED: FechasGlobalSeedData = {
  title: fechasCierre.title,
  intro: fechasCierre.intro,
  discounts: {
    heading: fechasCierre.discounts.heading,
    rows: fechasCierre.discounts.rows.map((row) => ({
      descuento: row.descuento,
      tipo: row.tipo,
      condicion: row.condicion,
      vigencia: row.vigencia,
    })),
  },
  closings: {
    heading: fechasCierre.closings.heading,
    regions: fechasCierre.closings.regions.map((row) => ({
      label: row.label,
      detail: row.detail,
      date: row.date,
    })),
    milestones: fechasCierre.closings.milestones.map((row) => ({
      label: row.label,
      detail: row.detail,
      date: row.date,
    })),
    note: fechasCierre.closings.note,
  },
}

export async function seedFechasGlobal(
  payload: SeedPayloadClient,
  data: FechasGlobalSeedData = FECHAS_GLOBAL_SEED,
  onEvent: (message: string) => void = () => undefined,
): Promise<FechasSeedReport> {
  const report: FechasSeedReport = {
    created: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    const existing = await payload.findGlobal({
      slug: 'fechas-global',
      locale: 'es',
      depth: 0,
    })

    if (isFechasGlobalSeeded(existing)) {
      report.skipped++
      onEvent('  - Skipped existing FechasGlobal')
      return report
    }

    await payload.updateGlobal({
      slug: 'fechas-global',
      locale: 'es',
      data,
    })

    report.created++
    onEvent('  + Created FechasGlobal')
  } catch (err) {
    report.errors++
    onEvent(`  ✗ Error processing FechasGlobal: ${(err as Error).message}`)
  }

  return report
}
