/**
 * Seed script: loads jurors from src/mocks/jurors.json into Payload/PostgreSQL.
 *
 * Idempotent — safe to run multiple times. Upserts by name + edition (exact match).
 * Does NOT delete existing jurors. Does NOT set photo (Media pending).
 * Relates each juror to the current edition (2026). If the edition is missing,
 * skips that juror and warns (does NOT create editions automatically).
 *
 * Usage: npm run seed:jurors
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

interface JurorMock {
  slug: string
  name: string
  country: string
  role: string | null
  agency: string | null
  photoUrl: string | null
}

async function seedJurors() {
  // Dynamic imports AFTER env is loaded (ESM static imports are hoisted)
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Jurors seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'jurors.json')
  const jurorsMock: JurorMock[] = JSON.parse(readFileSync(mockPath, 'utf-8'))

  console.log(`📂 Loaded ${jurorsMock.length} jurors from mock\n`)

  const payload = await getPayload({ config })

  // Find the current edition (2026)
  const editions = await payload.find({
    collection: 'editions',
    where: { isCurrent: { equals: true } },
    limit: 1,
  })

  if (editions.docs.length === 0) {
    console.error('❌ No current edition found. Run `npm run seed:edition` first.')
    process.exit(1)
  }

  const editionId = editions.docs[0].id
  const editionYear = editions.docs[0].year
  console.log(`📅 Using edition: ${editionYear} (id: ${editionId})\n`)

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const [index, juror] of jurorsMock.entries()) {
    try {
      const existing = await payload.find({
        collection: 'jurors',
        where: {
          and: [
            { name: { equals: juror.name } },
            { edition: { equals: editionId } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const needsUpdate =
          doc.country !== juror.country ||
          doc.role !== (juror.role ?? undefined) ||
          doc.agency !== (juror.agency ?? undefined) ||
          doc.active !== true ||
          doc.order !== index

        if (needsUpdate) {
          await payload.update({
            collection: 'jurors',
            id: doc.id,
            data: {
              country: juror.country,
              role: juror.role ?? undefined,
              agency: juror.agency ?? undefined,
              active: true,
              order: index,
            },
          })
          updated++
          console.log(`  ✓ Updated: ${juror.name}`)
        } else {
          skipped++
          console.log(`  - Skipped (no changes): ${juror.name}`)
        }
      } else {
        await payload.create({
          collection: 'jurors',
          data: {
            name: juror.name,
            country: juror.country,
            role: juror.role ?? undefined,
            agency: juror.agency ?? undefined,
            edition: editionId,
            active: true,
            order: index,
          },
        })
        created++
        console.log(`  + Created: ${juror.name}`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing "${juror.name}":`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${jurorsMock.length}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedJurors().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
