import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local before anything touches process.env ─────────────
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
  console.warn('⚠️  Could not read .env.local — DATABASE_URI and PAYLOAD_SECRET must be set externally.')
}

interface RubroMock {
  number: number
  code: string
  name: string
  href: string
}

async function seedRubros() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Rubros seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'rubros.json')
  const rubrosMock: RubroMock[] = JSON.parse(readFileSync(mockPath, 'utf-8'))

  console.log(`📂 Loaded ${rubrosMock.length} rubros from mock\n`)

  const payload = await getPayload({ config })

  // 1. Find or create 2026 edition
  let editionId: string | number = ''
  const editionResult = await payload.find({
    collection: 'editions',
    where: { year: { equals: 2026 } },
    limit: 1,
  })

  if (editionResult.docs.length > 0) {
    editionId = editionResult.docs[0].id
    console.log(`📍 Using existing 2026 edition (ID: ${editionId})`)
  } else {
    const newEdition = await payload.create({
      collection: 'editions',
      data: {
        year: 2026,
        isCurrent: true,
        title: 'FIP Festival 2026',
        status: 'active',
      },
    })
    editionId = newEdition.id
    console.log(`+ Created new 2026 edition (ID: ${editionId})`)
  }

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const item of rubrosMock) {
    try {
      const existing = await payload.find({
        collection: 'rubros',
        where: {
          and: [
            { edition: { equals: editionId } },
            { number: { equals: item.number } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const needsUpdate =
          doc.code !== item.code ||
          doc.name !== item.name ||
          doc.order !== item.number

        if (needsUpdate) {
          await payload.update({
            collection: 'rubros',
            id: doc.id,
            data: {
              code: item.code,
              name: item.name,
              order: item.number,
            },
          })
          updated++
          console.log(`  ✓ Updated: Rubro ${item.number} - ${item.name}`)
        } else {
          skipped++
          console.log(`  - Skipped (no changes): Rubro ${item.number}`)
        }
      } else {
        await payload.create({
          collection: 'rubros',
          data: {
            number: item.number,
            code: item.code,
            name: item.name,
            order: item.number,
            edition: editionId,
          },
        })
        created++
        console.log(`  + Created: Rubro ${item.number} - ${item.name}`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing Rubro ${item.number}:`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${rubrosMock.length}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedRubros().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
