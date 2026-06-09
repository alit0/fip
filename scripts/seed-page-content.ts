import { getPayload } from 'payload'
import config from '../payload.config'
import {
  HOME_INSTITUTIONAL_PAGE_CONTENT,
  seedPageContentEntries,
} from './page-content-seed-data'

async function seedPageContent() {
  console.log('🌱 Starting PageContent seed...\n')
  console.log(
    `📂 Loaded ${HOME_INSTITUTIONAL_PAGE_CONTENT.length} Home institutional entries (es)\n`,
  )

  const payload = await getPayload({ config })
  const report = await seedPageContentEntries(payload, undefined, console.log)

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${report.created}`)
  console.log(`  Skipped:  ${report.skipped}`)
  console.log(`  Errors:   ${report.errors}`)

  process.exit(report.errors > 0 ? 1 : 0)
}

seedPageContent().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
