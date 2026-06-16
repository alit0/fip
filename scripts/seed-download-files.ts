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

async function seedDownloadFiles() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')

  console.log('🌱 Starting DownloadFiles seed...\n')

  const mockPath = resolve(__dirname, '..', 'src', 'mocks', 'site-config.json')
  const siteConfigMock = JSON.parse(readFileSync(mockPath, 'utf-8'))

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  const downloads = [];
  let orderEs = 0;
  for (const item of siteConfigMock.downloads.es) {
    const format = item.href.split('.').pop();
    let key = item.href.split('/').pop()?.split('.')[0] || `download-es-${orderEs}`;
    if (key.endsWith('_port')) key = key.replace('_port', '');
    
    downloads.push({
      key,
      label: item.label,
      language: 'es',
      format,
      fileUrl: item.href,
      section: 'footer',
      order: orderEs++,
      active: true,
    });
  }

  let orderPt = 0;
  for (const item of siteConfigMock.downloads.pt) {
    const format = item.href.split('.').pop();
    let key = item.href.split('/').pop()?.split('.')[0] || `download-pt-${orderPt}`;
    if (key.endsWith('_port')) key = key.replace('_port', '');
    if (key === 'tarifario-port__feb2026') key = 'tarifario_feb2026';
    if (key === 'Replicas-Orden_de_Compra_port') key = 'replicas_Orden_de_Compra';
    if (key === 'regulamento') key = 'reglamento';
    if (key === 'inscricao_autocompletable') key = 'inscripcion_autocompletable';
    if (key === 'categorias') key = 'categorias';
    if (key === 'fip_apresentacao_campanas') key = 'fip_presentacion_campanas';
    
    downloads.push({
      key,
      label: item.label,
      language: 'pt',
      format,
      fileUrl: item.href,
      section: 'footer',
      order: orderPt++,
      active: true,
    });
  }

  for (const data of downloads) {
    try {
      const existing = await payload.find({
        collection: 'download-files',
        where: {
          and: [
            { key: { equals: data.key } },
            { language: { equals: data.language } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0] as any
        const needsUpdate = 
          doc.label !== data.label ||
          doc.format !== data.format ||
          doc.fileUrl !== data.fileUrl ||
          doc.section !== data.section ||
          doc.order !== data.order ||
          doc.active !== data.active

        if (needsUpdate) {
          await payload.update({
            collection: 'download-files',
            id: doc.id,
            data,
          })
          updated++
          console.log(`  ✓ Updated: ${data.label} (${data.language})`)
        } else {
          skipped++
        }
      } else {
        await payload.create({
          collection: 'download-files',
          data,
        })
        created++
        console.log(`  + Created: ${data.label} (${data.language})`)
      }
    } catch (err) {
      errors++
      console.error(`  ✗ Error processing ${data.label}:`, err)
    }
  }

  console.log('\n📊 Seed complete:')
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)

  process.exit(errors > 0 ? 1 : 0)
}

seedDownloadFiles().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
