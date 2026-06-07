/**
 * Seed script: creates or updates the 2026 edition in Payload/PostgreSQL.
 *
 * Idempotent — safe to run multiple times. Upserts by year (exact match).
 * Does NOT delete existing editions.
 *
 * Usage: npm run seed:edition
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

interface EditionSeed {
  year: number
  isCurrent: boolean
  title: string
  status: 'active'
}

const EDITION_2026: EditionSeed = {
  year: 2026,
  isCurrent: true,
  title: 'FIP Festival 2026',
  status: 'active',
}

async function seedEdition() {
  // Dynamic imports AFTER env is loaded (ESM static imports are hoisted)
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Edition seed...\n')

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  try {
    const existing = await payload.find({
      collection: 'editions',
      where: {
        year: { equals: EDITION_2026.year },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      const needsUpdate =
        doc.isCurrent !== EDITION_2026.isCurrent ||
        doc.title !== EDITION_2026.title ||
        doc.status !== EDITION_2026.status

      if (needsUpdate) {
        await payload.update({
          collection: 'editions',
          id: doc.id,
          data: {
            isCurrent: EDITION_2026.isCurrent,
            title: EDITION_2026.title,
            status: EDITION_2026.status,
          },
        })
        updated++
        console.log(`  ✓ Updated: ${EDITION_2026.title}`)
      } else {
        skipped++
        console.log(`  - Skipped (no changes): ${EDITION_2026.title}`)
      }
    } else {
      await payload.create({
        collection: 'editions',
        data: {
          year: EDITION_2026.year,
          isCurrent: EDITION_2026.isCurrent,
          title: EDITION_2026.title,
          status: EDITION_2026.status,
        },
      })
      created++
      console.log(`  + Created: ${EDITION_2026.title}`)
    }
  } catch (err) {
    errors++
    console.error(`  ✗ Error processing "${EDITION_2026.title}":`, err)
  }

  // Warn if other editions have isCurrent=true
  try {
    const allCurrent = await payload.find({
      collection: 'editions',
      where: { isCurrent: { equals: true } },
      limit: 10,
    })
    if (allCurrent.docs.length > 1) {
      console.warn(
        `\n⚠️  Multiple editions have isCurrent=true: ${allCurrent.docs.map((d) => d.year).join(', ')}`,
      )
      console.warn('   Consider setting only one as current.\n')
    }
  } catch {
    // ignore — table may not exist yet
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedEdition().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
