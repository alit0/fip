/**
 * Seed script: loads sponsors from src/mocks/sponsors.json into Payload/PostgreSQL.
 *
 * Idempotent — safe to run multiple times. Upserts by name (exact match).
 * Does NOT delete existing sponsors. Does NOT set logo (Media pending).
 *
 * Usage: npm run seed:sponsors
 */

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

interface SponsorMock {
  name: string
  logoUrl: string | null
  url: string | null
}

async function seedSponsors() {
  // Dynamic imports AFTER env is loaded (ESM static imports are hoisted)
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Sponsors seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'sponsors.json')
  const sponsorsMock: SponsorMock[] = JSON.parse(readFileSync(mockPath, 'utf-8'))

  console.log(`📂 Loaded ${sponsorsMock.length} sponsors from mock\n`)

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const [index, sponsor] of sponsorsMock.entries()) {
    try {
      const existing = await payload.find({
        collection: 'sponsors',
        where: {
          name: { equals: sponsor.name },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const mockUrl = sponsor.url ?? null
        const docUrl = doc.url ?? null
        const needsUpdate =
          docUrl !== mockUrl ||
          doc.active !== true ||
          doc.order !== index

        if (needsUpdate) {
          await payload.update({
            collection: 'sponsors',
            id: doc.id,
            data: {
              url: sponsor.url ?? undefined,
              active: true,
              order: index,
            },
          })
          updated++
          console.log(`  ✓ Updated: ${sponsor.name}`)
        } else {
          skipped++
          console.log(`  - Skipped (no changes): ${sponsor.name}`)
        }
      } else {
        await payload.create({
          collection: 'sponsors',
          data: {
            name: sponsor.name,
            url: sponsor.url ?? undefined,
            active: true,
            order: index,
          },
        })
        created++
        console.log(`  + Created: ${sponsor.name}`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing "${sponsor.name}":`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${sponsorsMock.length}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedSponsors().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
