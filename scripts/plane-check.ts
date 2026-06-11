/**
 * Plane API access check (reusable, secret-safe).
 *
 * Reads PLANE_API_KEY / PLANE_WORKSPACE / PLANE_PROJECT_ID from the environment
 * (loaded from .env.local, same pattern as the seed scripts), performs a GET to
 * the Plane API (list project states), and prints whether access works.
 *
 * Contract for every agent (Cloe, Gepeto, Chano, Geni, Opi): the Plane key lives
 * ONLY in .env.local as PLANE_API_KEY. Never hardcode it, never paste it per
 * session, never print it. Read it from the environment.
 *
 * This script never prints the key — on success or failure.
 *
 * Run: npm run plane:check
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const PLANE_API_BASE = 'https://plane.allitto.com/api/v1'

// ── Load .env.local into process.env (without overriding externally-set vars) ──
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
  // .env.local is optional if the vars are provided externally (e.g. CI).
}

function fail(message: string): 1 {
  console.error(`❌ Plane access FAILED: ${message}`)
  return 1
}

// Returns the desired exit code. Never calls process.exit() directly so that
// undici's keep-alive sockets can close cleanly (avoids a libuv teardown
// assertion on Windows that would otherwise produce a bogus non-zero exit).
async function main(): Promise<number> {
  const apiKey = process.env.PLANE_API_KEY
  const workspace = process.env.PLANE_WORKSPACE
  const projectId = process.env.PLANE_PROJECT_ID

  if (!apiKey) return fail('PLANE_API_KEY is not set. Paste it into .env.local.')
  if (!workspace) return fail('PLANE_WORKSPACE is not set in .env.local.')
  if (!projectId) return fail('PLANE_PROJECT_ID is not set in .env.local.')

  const url = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/states/`

  let res: Response
  try {
    res = await fetch(url, { headers: { 'X-API-Key': apiKey } })
  } catch (e) {
    return fail(`network error reaching Plane: ${(e as Error).message}`)
  }

  if (!res.ok) {
    const hint = res.status === 401 || res.status === 403
      ? ' — check the key is valid and not revoked'
      : ''
    return fail(`HTTP ${res.status} ${res.statusText} on GET /states/${hint}`)
  }

  const data = (await res.json()) as { results?: any[] }
  const count = Array.isArray(data.results) ? data.results.length : 0
  
  if (process.argv.includes('--list-states')) {
    console.log(JSON.stringify(data.results?.map(s => ({ id: s.id, name: s.name })), null, 2))
    return 0
  }

  if (process.argv.includes('--list-labels')) {
    const labelUrl = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/labels/`
    const labelRes = await fetch(labelUrl, { headers: { 'X-API-Key': apiKey || '' } })
    const labelData = (await labelRes.json()) as { results?: any[] }
    console.log(JSON.stringify(labelData.results?.map(l => ({ id: l.id, name: l.name })), null, 2))
    return 0
  }

  if (process.argv.includes('--list-projects')) {
    const projectUrl = `${PLANE_API_BASE}/workspaces/${workspace}/projects/`
    const projectRes = await fetch(projectUrl, { headers: { 'X-API-Key': apiKey || '' } })
    const projectData = (await projectRes.json()) as { results?: any[] }
    console.log(JSON.stringify(projectData.results?.map(p => ({ id: p.id, name: p.name })), null, 2))
    return 0
  }

  if (process.argv.includes('--geni-loop')) {
    const statesRes = await fetch(`${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/states/`, { headers: { 'X-API-Key': apiKey || '' } })
    const statesData = (await statesRes.json()) as { results: any[] }
    const stateMap = Object.fromEntries(statesData.results.map(s => [s.id, s.name]))
    
    const discoveryId = statesData.results.find(s => s.name === 'Discovery')?.id
    const readyForDocsId = statesData.results.find(s => s.name === 'Ready for Docs')?.id
    
    const issueUrl = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/issues/?labels=77014707-48d7-46b9-a75a-a00a52a759f3`
    const issueRes = await fetch(issueUrl, { headers: { 'X-API-Key': apiKey || '' } })
    const issueData = (await issueRes.json()) as { results: any[] }
    
    const candidates = issueData.results.filter(i => i.state === discoveryId || i.state === readyForDocsId)
    
    console.log(JSON.stringify(candidates.map(i => ({
      id: i.id,
      name: i.name,
      state: stateMap[i.state],
      priority: i.priority,
      parent: i.parent
    })), null, 2))
    return 0
  }

  if (process.argv.includes('--get-issue')) {
    const issueId = process.argv[process.argv.indexOf('--get-issue') + 1]
    const issueUrl = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/issues/${issueId}/`
    const issueRes = await fetch(issueUrl, { headers: { 'X-API-Key': apiKey || '' } })
    const issueData = await issueRes.json()
    console.log(JSON.stringify(issueData, null, 2))
    return 0
  }

  if (process.argv.includes('--update-state')) {
    const issueId = process.argv[process.argv.indexOf('--update-state') + 1]
    const stateId = process.argv[process.argv.indexOf('--update-state') + 2]
    const issueUrl = `${PLANE_API_BASE}/workspaces/${workspace}/projects/${projectId}/issues/${issueId}/`
    const res = await fetch(issueUrl, {
      method: 'PATCH',
      headers: { 
        'X-API-Key': apiKey || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state: stateId })
    })
    if (res.ok) {
      console.log(`✅ Issue ${issueId} updated to state ${stateId}`)
      return 0
    } else {
      return fail(`HTTP ${res.status} updating issue state`)
    }
  }

  console.log(
    `✅ Plane access OK — workspace "${workspace}", project ${projectId}: ${count} states readable.`,
  )
  return 0
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((e) => {
    process.exitCode = fail((e as Error).message)
  })
