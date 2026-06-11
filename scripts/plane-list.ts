/**
 * List all Plane issues (for discovery).
 * Reads PLANE_API_KEY / PLANE_WORKSPACE / PLANE_PROJECT_ID from .env.local.
 * Usage: npx tsx scripts/plane-list.ts [--limit <n>]
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'

const PLANE_API_BASE = 'https://plane.allitto.com/api/v1'

// Load .env.local
const scriptDir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(scriptDir, '..', '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
} catch {
  // .env.local is optional if vars are provided externally
}

async function main() {
  const apiKey = process.env.PLANE_API_KEY
  const workspace = process.env.PLANE_WORKSPACE
  const projectId = process.env.PLANE_PROJECT_ID

  if (!apiKey || !workspace || !projectId) {
    console.error('❌ Missing Plane env vars. Check .env.local.')
    process.exit(1)
  }

  const { values, positionals } = parseArgs({
    options: {
      limit: { type: 'string', short: 'n' },
    },
    strict: false,
    tokens: true,
  })

  const limit = parseInt(typeof values.limit === 'string' ? values.limit : '10', 10)

  const url = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/issues/`
  const headers = { 'X-API-Key': apiKey }

  let page = 1
  let found = 0

  while (found < limit) {
    const res = await fetch(`${url}?page=${page}&limit=50`, { headers })
    if (!res.ok) {
      console.error(`❌ Plane API error: ${res.status} ${res.statusText}`)
      process.exit(1)
    }

    const data = await res.json()
    const results = data.results || []

    if (!results.length) break

    for (const item of results) {
      if (found >= limit) break

      const labels = Array.isArray(item.labels) ? item.labels : []
      const stateName = item.state ? (item.state as any)?.name : 'Unknown'

      found++
      console.log(
        `#${found}: [${stateName}] ${item.name} (${item.id})`,
      )
      console.log(`   Labels: ${labels.map((l: any) => l.name).join(', ') || 'none'}`)
      console.log(`   URL: https://plane.allitto.com/${workspace}/${projectId}/issues/${item.id}`)
      console.log('')
    }

    if (page >= (data.total_pages || 1)) break
    page++
  }

  if (found === 0) {
    console.log('No issues found.')
  } else {
    console.log(`Total: ${found} issue(s) shown.`)
  }
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
