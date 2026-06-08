/**
 * Seed script: loads Hall of Fame members from src/mocks/hall-de-la-fama.json into Payload/PostgreSQL.
 *
 * Idempotent — safe to run multiple times. Upserts by slug (exact match).
 * Does NOT delete existing members. Does NOT set photo/logo (Media pending).
 * Does NOT require an edition (HallOfFameMembers is a global/historical entity).
 *
 * Usage: npm run seed:hall-of-fame
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

interface HallMemberMock {
  slug: string
  name: string
  role: string
  company: string
  country: string
  countryCode: string | null
  photoUrl: string | null
  logoTodo: string | null
  bioText: string
  bioImageTodo: string | null
  order: number
}

interface HallDeLaFamaMock {
  title: string
  institutional: Array<{ title: string; body: string }>
  members: HallMemberMock[]
}

async function seedHallOfFame() {
  // Dynamic imports AFTER env is loaded (ESM static imports are hoisted)
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting Hall of Fame seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'hall-de-la-fama.json')
  const hallMock: HallDeLaFamaMock = JSON.parse(readFileSync(mockPath, 'utf-8'))
  const members = hallMock.members

  console.log(`📂 Loaded ${members.length} members from mock\n`)

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const member of members) {
    try {
      const existing = await payload.find({
        collection: 'hall-of-fame-members',
        where: { slug: { equals: member.slug } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const needsUpdate =
          doc.name !== member.name ||
          doc.country !== member.country ||
          doc.countryCode !== (member.countryCode ?? undefined) ||
          doc.role !== (member.role ?? undefined) ||
          doc.company !== (member.company ?? undefined) ||
          doc.bio !== (member.bioText ?? undefined) ||
          doc.active !== true ||
          doc.order !== member.order

        if (needsUpdate) {
          await payload.update({
            collection: 'hall-of-fame-members',
            id: doc.id,
            data: {
              name: member.name,
              country: member.country,
              countryCode: member.countryCode ?? undefined,
              role: member.role ?? undefined,
              company: member.company ?? undefined,
              bio: member.bioText ?? undefined,
              active: true,
              order: member.order,
            },
          })
          updated++
          console.log(`  ✓ Updated: ${member.name} (${member.slug})`)
        } else {
          skipped++
          console.log(`  - Skipped (no changes): ${member.name} (${member.slug})`)
        }
      } else {
        await payload.create({
          collection: 'hall-of-fame-members',
          data: {
            slug: member.slug,
            name: member.name,
            country: member.country,
            countryCode: member.countryCode ?? undefined,
            role: member.role ?? undefined,
            company: member.company ?? undefined,
            bio: member.bioText ?? undefined,
            active: true,
            order: member.order,
          },
        })
        created++
        console.log(`  + Created: ${member.name} (${member.slug})`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing "${member.name}" (${member.slug}):`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Total processed: ${members.length}`)
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedHallOfFame().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
