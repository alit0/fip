import { getPayload } from 'payload'
import config from '../payload.config'
import {
  PREMIOS_GLOBAL_SEED,
  seedPremiosGlobal,
} from './premios-seed-data'

async function seedPremios() {
  console.log('🌱 Starting PremiosGlobal seed...\n')
  console.log(`📂 Loaded PremiosGlobal seed from mocks: ${PREMIOS_GLOBAL_SEED.title}\n`)

  const payload = await getPayload({ config })
  const report = await seedPremiosGlobal(payload, undefined, console.log)

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${report.created}`)
  console.log(`  Skipped:  ${report.skipped}`)
  console.log(`  Errors:   ${report.errors}`)

  process.exit(report.errors > 0 ? 1 : 0)
}

seedPremios().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
