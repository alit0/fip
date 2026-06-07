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

async function seedWinners() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Winners seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'ganadores.json')
  const ganadoresMock = JSON.parse(readFileSync(mockPath, 'utf-8'))

  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0
  let errors = 0

  // We only seed years that have "completo" or "parcial" status (HTML tables exist)
  const yearsToSeed = ['2025', '2020', '2021', '2022']

  for (const yearStr of yearsToSeed) {
    const yearData = ganadoresMock[yearStr]
    if (!yearData) continue

    console.log(`\n📅 Processing year ${yearStr}...`)

    // 1. Find edition for this year (MUST exist)
    const editionResult = await payload.find({
      collection: 'editions',
      where: { year: { equals: parseInt(yearStr) } },
      limit: 1,
    })

    if (editionResult.docs.length === 0) {
      console.warn(`  ⚠️  Edition ${yearStr} not found in DB. Skipping year.`)
      continue
    }

    const editionId = editionResult.docs[0].id
    console.log(`  📍 Using edition ${yearStr} (ID: ${editionId})`)

    // 2. We need Categories for this edition to exist (MUST exist)
    const catsInDb = await payload.find({
      collection: 'categories',
      where: { edition: { equals: editionId } },
      limit: 1000,
      depth: 1,
    })

    if (catsInDb.docs.length === 0) {
      console.warn(`  ⚠️  No categories found in DB for edition ${yearStr}. Skipping year.`)
      continue
    }
    
    const catMap = new Map<string, any>() // key: categoryCode
    catsInDb.docs.forEach(c => {
      catMap.set((c as any).code, c)
    })

    console.log(`  📂 Found ${catMap.size} categories in DB for ${yearStr}`)

    // 3. Process "grandes" (Reconocimientos Especiales)
    for (const g of yearData.grandes || []) {
      try {
        const existing = await payload.find({
          collection: 'winners',
          where: {
            and: [
              { edition: { equals: editionId } },
              { isGrandReco: { equals: true } },
              { specialAwardName: { equals: g.premio } },
              { agency: { equals: g.ganador } },
            ],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          skipped++
        } else {
          // For "grandes", we might not have a real Category record.
          // Since category is REQUIRED in the collection, we'll use a dummy or skip.
          // Better: use the first category found for that edition as a placeholder 
          // or just skip if no categories exist.
          const anyCat = Array.from(catMap.values())[0]
          if (!anyCat) {
             // console.warn(`  ⚠️  Cannot seed Grande ${g.premio}: No categories found for edition ${yearStr}`)
             continue
          }

          await payload.create({
            collection: 'winners',
            data: {
              edition: editionId,
              rubro: anyCat.rubro.id || anyCat.rubro,
              category: anyCat.id,
              awardLevel: 'especial',
              specialAwardName: g.premio,
              campaign: '',
              brand: '',
              agency: g.ganador,
              country: g.pais,
              isGrandReco: true,
              order: 0,
            },
          })
          created++
        }
      } catch (err) {
        errors++
        console.error(`  ✗ Error processing Grande ${g.premio}:`, err)
      }
    }

    // 4. Process "rubros" -> "categorias" -> "ganadores"
    for (const r of yearData.rubros || []) {
      for (const c of r.categorias || []) {
        const catDoc = catMap.get(c.codigo)
        if (!catDoc) continue

        for (const w of c.ganadores || []) {
          try {
            const awardLevel = (w.nivel as string).toLowerCase().replace(' ', '')
            
            const existing = await payload.find({
              collection: 'winners',
              where: {
                and: [
                  { edition: { equals: editionId } },
                  { category: { equals: catDoc.id } },
                  { awardLevel: { equals: awardLevel } },
                  { campaign: { equals: w.campania } },
                  { agency: { equals: w.agencia } },
                ],
              },
              limit: 1,
            })

            if (existing.docs.length > 0) {
              skipped++
            } else {
              await payload.create({
                collection: 'winners',
                data: {
                  edition: editionId,
                  rubro: catDoc.rubro.id || catDoc.rubro,
                  category: catDoc.id,
                  awardLevel: awardLevel as any,
                  campaign: w.campania,
                  brand: w.marca,
                  agency: w.agencia,
                  country: w.pais,
                  isGrandReco: false,
                  order: 0,
                },
              })
              created++
            }
          } catch (err) {
            errors++
            console.error(`  ✗ Error processing winner ${w.campania}:`, err)
          }
        }
      }
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${created + skipped + errors}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  0 (not implemented for winners)`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedWinners().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
