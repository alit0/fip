import { getPayload } from 'payload'
import config from '../payload.config'
import {
  INSCRIPCION_GLOBAL_SEED,
  seedInscripcionGlobal,
} from './inscripcion-seed-data'

async function seedInscripcion() {
  console.log('🌱 Starting InscripcionGlobal seed...\n')
  console.log(`📂 Loaded InscripcionGlobal seed from mocks: ${INSCRIPCION_GLOBAL_SEED.title}\n`)

  const payload = await getPayload({ config })
  const report = await seedInscripcionGlobal(payload, undefined, console.log)

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${report.created}`)
  console.log(`  Skipped:  ${report.skipped}`)
  console.log(`  Errors:   ${report.errors}`)

  process.exit(report.errors > 0 ? 1 : 0)
}

seedInscripcion().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
