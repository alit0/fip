/**
 * AGENTESOPE-42: Seed PT (Portuguese) localized content.
 *
 * This script populates the `pt` locale for:
 *   - FechasGlobal       (dates & discounts)
 *   - InscripcionGlobal  (how-to-enter page)
 *   - PremiosGlobal      (awards & replicas)
 *   - PageContent        (home institutional sections)
 *
 * DownloadFiles: the collection uses a `language` field (not Payload locale),
 * so PT download-files entries already exist from seed-download-files.ts.
 * No action needed here for that collection.
 *
 * SiteConfig: only `address` is localized and it is a physical address
 * (same in all locales). No PT seed needed.
 *
 * Usage:
 *   npx tsx scripts/seed-pt-content.ts
 *
 * Prerequisites: .env.local must contain DATABASE_URI and PAYLOAD_SECRET.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
  console.log('🔑 Loaded .env.local')
} catch {
  console.warn(
    '⚠️  Could not read .env.local — DATABASE_URI and PAYLOAD_SECRET must be set externally.',
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some(hasMeaningfulValue)
}

function lexicalFromPlainText(text: string): unknown {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
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

// ── Main ─────────────────────────────────────────────────────────────────────

async function seedPtContent() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const { FECHAS_GLOBAL_SEED_PT } = await import('./fechas-seed-data-pt')
  const { INSCRIPCION_GLOBAL_SEED_PT } = await import('./inscripcion-seed-data-pt')
  const { PREMIOS_GLOBAL_SEED_PT } = await import('./premios-seed-data-pt')

  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0
  let errors = 0

  function log(msg: string) {
    console.log(msg)
  }

  // ── 1. FechasGlobal PT ────────────────────────────────────────────────────
  log('\n📅 Seeding FechasGlobal (pt)...')
  try {
    const existing = await payload.findGlobal({
      slug: 'fechas-global',
      locale: 'pt',
      depth: 0,
    })

    if (hasMeaningfulValue((existing as any)?.title)) {
      log('  - Skipped: FechasGlobal (pt) already has content')
      skipped++
    } else {
      await payload.updateGlobal({
        slug: 'fechas-global',
        locale: 'pt',
        data: FECHAS_GLOBAL_SEED_PT,
      })
      log('  + Created: FechasGlobal (pt)')
      created++
    }
  } catch (err) {
    log(`  ✗ Error: FechasGlobal (pt) — ${(err as Error).message}`)
    errors++
  }

  // ── 2. InscripcionGlobal PT ───────────────────────────────────────────────
  log('\n📝 Seeding InscripcionGlobal (pt)...')
  try {
    const existing = await payload.findGlobal({
      slug: 'inscripcion-global',
      locale: 'pt',
      depth: 0,
    })

    if (hasMeaningfulValue((existing as any)?.title)) {
      log('  - Skipped: InscripcionGlobal (pt) already has content')
      skipped++
    } else {
      await payload.updateGlobal({
        slug: 'inscripcion-global',
        locale: 'pt',
        data: INSCRIPCION_GLOBAL_SEED_PT,
      })
      log('  + Created: InscripcionGlobal (pt)')
      created++
    }
  } catch (err) {
    log(`  ✗ Error: InscripcionGlobal (pt) — ${(err as Error).message}`)
    errors++
  }

  // ── 3. PremiosGlobal PT ───────────────────────────────────────────────────
  log('\n🏆 Seeding PremiosGlobal (pt)...')
  try {
    const existing = await payload.findGlobal({
      slug: 'premios-global',
      locale: 'pt',
      depth: 0,
    })

    if (hasMeaningfulValue((existing as any)?.title)) {
      log('  - Skipped: PremiosGlobal (pt) already has content')
      skipped++
    } else {
      await payload.updateGlobal({
        slug: 'premios-global',
        locale: 'pt',
        data: PREMIOS_GLOBAL_SEED_PT,
      })
      log('  + Created: PremiosGlobal (pt)')
      created++
    }
  } catch (err) {
    log(`  ✗ Error: PremiosGlobal (pt) — ${(err as Error).message}`)
    errors++
  }

  // ── 4. PageContent — home institutional (pt) ──────────────────────────────
  log('\n🏠 Seeding PageContent home institutional (pt)...')

  // PT translations of the home institutional sections.
  // Source: home.json (ES). Prose translated; section titles kept in CAPS as-is
  // since they are displayed as headings and match the ES original style.
  const PT_HOME_INSTITUTIONAL = [
    {
      pageKey: 'home',
      sectionKey: 'institutional-intro',
      title: 'FIP 2025 - Alguns comentários da 26ª edição',
      body: [
        'Com uma cifra realmente extraordinária de participantes inscritos e com a presença de agências líderes de envergadura mundial, o FIP consolida, após 26 anos brilhantes, seu prestígio alcançado há muito tempo. Seu júri internacional contou também com figuras de excepcional trajetória e o FIP se considera honrado com sua colaboração.',
        'As redes foram novamente e centralmente um grande divulgador do FIP e seus prêmios, e isso é mais um indicador da notável vigência do que muitos consideram uma referência "de ponta mundial" entre os grandes prêmios internacionais da atividade. Um grande número de publicações gráficas e digitais difundiu também essa vigência, marcando a criatividade e os méritos em ascensão dos melhores profissionais da região.',
        'O FIP contou em 2025 com 127 categorias que analisaram 24 ferramentas deste "novo marketing" da era tecnológica que envolve a humanidade e, entre elas, as categorias de eventos vêm experimentando um notável crescimento que se reflete em ter sido o segmento mais disputado por toda classe de ideias. O FIP ofereceu este ano 40 categorias de eventos.',
        'Esta 26ª edição do festival contou com a participação de uma singular quantidade de marcas finalistas que disputaram, no dia 3 de dezembro, no espetacular Scala Hotel de Buenos Aires, os já prestigiosos prêmios "Agência do Ano" e os prêmios "Marcas do Ano País" do FIP, entregues àquelas que mais prêmios obtêm em distintos segmentos somando os pontos outorgados pelo Regulamento do festival. Por outro lado, o FIP anunciou o lançamento da categoria Promoções em Vídeo Cases, novo prêmio especial que se aplicará a numerosas ferramentas do FIP, as quais, desde sua apresentação, geraram muito interesse no segmento.',
      ].join('\n\n'),
    },
    {
      pageKey: 'home',
      sectionKey: 'institutional-section-1',
      title: 'A NOITE DOS CAMPEÕES',
      body: 'O festival exibiu um exigente "Plano de Tempos" quanto ao seu cronograma, que desemboca em seu evento de autêntica gala "Os Campeões do FIP", ao qual sua organização acertadamente subtitulou "o Marketing do Século XXI" e que foi realizado em Buenos Aires, Argentina. No evento, que é conduzido há anos por Khaled Hallar, figura da TV argentina, também foram entregues os Prêmios pela Trajetória Profissional e foram anunciados os novos integrantes do Hall da Fama do Festival. Por fim, cabe destacar que os prêmios obtidos pelas agências nas categorias do FIP somam para os rankings de cada país.',
    },
    {
      pageKey: 'home',
      sectionKey: 'institutional-section-2',
      title: 'OS ANÚNCIOS DO FIP',
      body: 'Foram anunciados 3 novos segmentos ou ferramentas de marketing que levarão o FIP a oferecer quase 150 categorias em 2026. São eles: The Women\'s FIP, inteiramente dedicado à mulher, Casos em Vídeo Case e Experiência de Marca em 7 categorias. Isso confirma a extraordinária atualidade do FIP, que já lançou sua próxima edição e já está convocando os novos integrantes do Júri Internacional.',
    },
  ]

  for (const entry of PT_HOME_INSTITUTIONAL) {
    try {
      // Find the existing ES doc to get its ID (since pageKey+sectionKey identify the doc)
      const found = await payload.find({
        collection: 'page-content',
        where: {
          and: [
            { pageKey: { equals: entry.pageKey } },
            { sectionKey: { equals: entry.sectionKey } },
          ],
        },
        limit: 1,
        locale: 'es',
      })

      if (found.docs.length === 0) {
        // ES doc doesn't exist yet — create with pt locale
        await payload.create({
          collection: 'page-content',
          locale: 'pt',
          data: {
            pageKey: entry.pageKey,
            sectionKey: entry.sectionKey,
            title: entry.title,
            body: lexicalFromPlainText(entry.body),
            order: 0,
            active: true,
          },
        })
        log(`  + Created (no ES base): ${entry.pageKey}/${entry.sectionKey} (pt)`)
        created++
      } else {
        const doc = found.docs[0] as any
        // Check if PT is already set
        const ptVersion = await payload.findByID({
          collection: 'page-content',
          id: doc.id,
          locale: 'pt',
          depth: 0,
        })

        if (hasMeaningfulValue((ptVersion as any)?.title)) {
          log(`  - Skipped: ${entry.pageKey}/${entry.sectionKey} (pt) already has content`)
          skipped++
        } else {
          await payload.update({
            collection: 'page-content',
            id: doc.id,
            locale: 'pt',
            data: {
              title: entry.title,
              body: lexicalFromPlainText(entry.body),
            },
          })
          log(`  + Updated: ${entry.pageKey}/${entry.sectionKey} (pt)`)
          created++
        }
      }
    } catch (err) {
      log(`  ✗ Error: ${entry.pageKey}/${entry.sectionKey} (pt) — ${(err as Error).message}`)
      errors++
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n📊 PT seed complete:')
  console.log(`  Created/Updated: ${created}`)
  console.log(`  Skipped:         ${skipped}`)
  console.log(`  Errors:          ${errors}`)

  if (errors > 0) {
    console.log('\n⚠️  Some entries failed. Check error messages above.')
  } else {
    console.log('\n✅ All PT content seeded successfully.')
  }

  process.exit(errors > 0 ? 1 : 0)
}

seedPtContent().catch((err) => {
  console.error('❌ PT seed failed:', err)
  process.exit(1)
})
