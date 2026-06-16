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

interface CategoryMock {
  rubroNumber: number
  code: string
  title: string | null
  description: string | null
  award: string
  isSpecial: boolean
  specialType: string | null
  isNew: boolean
}

async function seedCategories() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Categories seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'categories.json')
  const categoriesMock: CategoryMock[] = JSON.parse(readFileSync(mockPath, 'utf-8'))

  console.log(`📂 Loaded ${categoriesMock.length} categories from mock\n`)

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

  // 2. Load all rubros for this edition to map them
  const rubrosResult = await payload.find({
    collection: 'rubros',
    where: { edition: { equals: editionId } },
    limit: 100,
  })
  
  const rubroMap = new Map<number, string | number>()
  rubrosResult.docs.forEach(r => {
    rubroMap.set((r as any).number, r.id)
  })
  
  console.log(`🗺️  Mapped ${rubroMap.size} rubros from DB\n`)

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const item of categoriesMock) {
    try {
      const rubroId = rubroMap.get(item.rubroNumber)
      if (!rubroId) {
        console.error(`  ✗ Rubro ${item.rubroNumber} not found in DB, skipping category ${item.code}`)
        errors++
        continue
      }

      const existing = await payload.find({
        collection: 'categories',
        where: {
          and: [
            { edition: { equals: editionId } },
            { rubro: { equals: rubroId } },
            { code: { equals: item.code } },
          ],
        },
        limit: 1,
      })

      const data = {
        rubro: rubroId,
        edition: editionId,
        code: item.code,
        title: item.title || '',
        description: item.description,
        awardIcon: (item.award === 'oro' || item.award === 'cristal' || item.award === 'platino') ? item.award : 'oro',
        isSpecial: item.isSpecial,
        specialType: item.specialType,
        isNew: item.isNew,
      }

      if (existing.docs.length > 0) {
        const doc = existing.docs[0] as any
        const needsUpdate = 
          doc.title !== data.title ||
          doc.description !== data.description ||
          doc.awardIcon !== data.awardIcon ||
          doc.isSpecial !== data.isSpecial ||
          doc.specialType !== data.specialType ||
          doc.isNew !== data.isNew

        if (needsUpdate) {
          await payload.update({
            collection: 'categories',
            id: doc.id,
            data,
          })
          updated++
          console.log(`  ✓ Updated: ${item.code} - ${item.title}`)
        } else {
          skipped++
          // console.log(`  - Skipped (no changes): ${item.code}`)
        }
      } else {
        await payload.create({
          collection: 'categories',
          data,
        })
        created++
        console.log(`  + Created: ${item.code} - ${item.title}`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing Category ${item.code}:`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${categoriesMock.length}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedCategories().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
