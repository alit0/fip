import { home } from '../src/mocks'

export type PageContentSeedEntry = {
  pageKey: string
  sectionKey: string
  title: string
  body: unknown
  order: number
  active: boolean
}

export type PageContentSeedReport = {
  created: number
  skipped: number
  errors: number
}

export type SeedPayloadClient = {
  find: (args: {
    collection: 'page-content'
    where: any
    limit: number
  }) => Promise<{ docs: unknown[] }>
  create: (args: {
    collection: 'page-content'
    data: PageContentSeedEntry
    locale: 'es'
  }) => Promise<unknown>
}

export function lexicalFromPlainText(text: string): unknown {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return {
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export const HOME_INSTITUTIONAL_PAGE_CONTENT: PageContentSeedEntry[] = [
  {
    pageKey: 'home',
    sectionKey: 'institutional-intro',
    title: home.institutional.heading,
    body: lexicalFromPlainText(home.institutional.intro.join('\n\n')),
    order: 0,
    active: true,
  },
  ...home.institutional.sections.map((section, index) => ({
    pageKey: 'home',
    sectionKey: `institutional-section-${index + 1}`,
    title: section.title,
    body: lexicalFromPlainText(section.body),
    order: index + 1,
    active: true,
  })),
]

export async function seedPageContentEntries(
  payload: SeedPayloadClient,
  entries: PageContentSeedEntry[] = HOME_INSTITUTIONAL_PAGE_CONTENT,
  onEvent: (message: string) => void = () => undefined,
): Promise<PageContentSeedReport> {
  const report: PageContentSeedReport = {
    created: 0,
    skipped: 0,
    errors: 0,
  }

  for (const entry of entries) {
    try {
      const existing = await payload.find({
        collection: 'page-content',
        where: {
          and: [
            { pageKey: { equals: entry.pageKey } },
            { sectionKey: { equals: entry.sectionKey } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        report.skipped++
        onEvent(`  - Skipped existing: ${entry.pageKey}/${entry.sectionKey}`)
        continue
      }

      await payload.create({
        collection: 'page-content',
        locale: 'es',
        data: entry,
      })

      report.created++
      onEvent(`  + Created: ${entry.pageKey}/${entry.sectionKey}`)
    } catch (err) {
      report.errors++
      onEvent(
        `  ✗ Error processing ${entry.pageKey}/${entry.sectionKey}: ${
          (err as Error).message
        }`,
      )
    }
  }

  return report
}
