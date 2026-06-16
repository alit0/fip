import { getPayload } from 'payload'
import config from '../payload.config'
import {
  FECHAS_GLOBAL_SEED,
  seedFechasGlobal,
} from './fechas-seed-data'

async function seedFechas() {
  console.log('🌱 Starting FechasGlobal seed...\n')
  console.log(`📂 Loaded FechasGlobal seed from mocks: ${FECHAS_GLOBAL_SEED.title}\n`)

  const payload = await getPayload({ config })
  const report = await seedFechasGlobal(payload, undefined, console.log)

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${report.created}`)
  console.log(`  Skipped:  ${report.skipped}`)
  console.log(`  Errors:   ${report.errors}`)

  process.exit(report.errors > 0 ? 1 : 0)
}

seedFechas().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
