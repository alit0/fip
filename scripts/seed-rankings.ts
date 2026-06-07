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

async function seedRankings() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Rankings seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'ranking.json')
  const rankingMock = JSON.parse(readFileSync(mockPath, 'utf-8'))

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  const year = 2024; // Default year for current ranking range

  for (const slug in rankingMock) {
    const countryData = rankingMock[slug];
    console.log(`\n🌍 Processing ${countryData.label}...`)
    
    for (const row of countryData.rows) {
      try {
        const parseVal = (v: string) => (v === '-' ? 0 : parseInt(v) || 0);
        
        const data = {
          country: countryData.label,
          countrySlug: slug,
          year: year,
          position: parseInt(row.position) || 0,
          agency: row.agency,
          granPrix: parseVal(row.granPrix),
          oro: parseVal(row.oro),
          plata: parseVal(row.plata),
          bronce: parseVal(row.bronce),
          total: parseVal(row.total),
          order: parseInt(row.position) || 0,
        }

        const existing = await payload.find({
          collection: 'ranking-entries',
          where: {
            and: [
              { countrySlug: { equals: slug } },
              { year: { equals: year } },
              { position: { equals: data.position } },
              { agency: { equals: data.agency } },
            ],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          const doc = existing.docs[0] as any
          const needsUpdate = 
            doc.granPrix !== data.granPrix ||
            doc.oro !== data.oro ||
            doc.plata !== data.plata ||
            doc.bronce !== data.bronce ||
            doc.total !== data.total

          if (needsUpdate) {
            await payload.update({
              collection: 'ranking-entries',
              id: doc.id,
              data,
            })
            updated++
            console.log(`  ✓ Updated: ${data.agency} (#${data.position})`)
          } else {
            skipped++
          }
        } else {
          await payload.create({
            collection: 'ranking-entries',
            data,
          })
          created++
          console.log(`  + Created: ${data.agency} (#${data.position})`)
        }
      } catch (err) {
        errors++
        console.error(`  ✗ Error processing ${row.agency}:`, err)
      }
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedRankings().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
