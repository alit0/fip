/**
 * Plane board backup (read-only). Exports every issue of the configured project
 * with: sequence id, uuid, title, description, state, labels, assignees and
 * comments. Writes a JSON snapshot + a readable Markdown summary.
 *
 * Safety net before any destructive board work. Never prints the API key.
 *
 * Run: npm run plane:backup
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const PLANE_API_BASE = 'https://plane.allitto.com/api/v1'
const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')

try {
  const envContent = readFileSync(resolve(repoRoot, '.env.local'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!(k in process.env)) process.env[k] = v
  }
} catch {}

const apiKey = process.env.PLANE_API_KEY ?? ''
const ws = process.env.PLANE_WORKSPACE ?? ''
const proj = process.env.PLANE_PROJECT_ID ?? ''
const projectBase = `${PLANE_API_BASE}/workspaces/${ws}/projects/${proj}`

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${projectBase}${path}`, { headers: { 'X-API-Key': apiKey } })
    if (!res.ok) {
      console.error(`  ! HTTP ${res.status} on ${path}`)
      return null
    }
    return (await res.json()) as T
  } catch (e) {
    console.error(`  ! error on ${path}: ${(e as Error).message}`)
    return null
  }
}

type Paginated<T> = { results?: T[]; count?: number; next_page_results?: boolean }

async function fetchAll<T>(path: string): Promise<T[]> {
  // Plane paginates with ?cursor / per_page; per_page=100 covers a 26-issue board.
  const data = await api<Paginated<T>>(`${path}?per_page=100`)
  return data?.results ?? []
}

async function main(): Promise<number> {
  if (!apiKey || !ws || !proj) {
    console.error('❌ Missing PLANE_API_KEY / PLANE_WORKSPACE / PLANE_PROJECT_ID in .env.local')
    return 1
  }

  console.log('📥 Backing up Plane board…')

  const [states, labels, members, issues] = await Promise.all([
    fetchAll<{ id: string; name: string; group: string }>('/states/'),
    fetchAll<{ id: string; name: string }>('/labels/'),
    fetchAll<{ member?: { id: string; display_name?: string; email?: string }; id?: string; display_name?: string; email?: string }>('/members/'),
    fetchAll<Record<string, unknown>>('/issues/'),
  ])

  const stateName = new Map(states.map((s) => [s.id, s.name]))
  const labelName = new Map(labels.map((l) => [l.id, l.name]))
  const memberName = new Map<string, string>()
  for (const m of members) {
    const mm = m.member ?? m
    const id = (mm as { id?: string }).id
    const name = (mm as { display_name?: string; email?: string }).display_name
      ?? (mm as { email?: string }).email
    if (id) memberName.set(id, name ?? id)
  }

  console.log(`  states=${states.length} labels=${labels.length} members=${members.length} issues=${issues.length}`)

  const cards: Array<Record<string, unknown>> = []
  for (const it of issues) {
    const id = it.id as string
    const seq = it.sequence_id as number
    // detail for full description_html
    const detail = await api<Record<string, unknown>>(`/issues/${id}/`)
    const comments = await fetchAll<Record<string, unknown>>(`/issues/${id}/comments/`)

    cards.push({
      card_id: `AGENTESOPE-${seq}`,
      sequence_id: seq,
      uuid: id,
      title: it.name,
      description_html: (detail?.description_html ?? it.description_html ?? '') as string,
      state: stateName.get(it.state as string) ?? (it.state as string),
      labels: ((it.label_ids as string[]) ?? []).map((l) => labelName.get(l) ?? l),
      assignees: ((it.assignee_ids as string[]) ?? []).map((a) => memberName.get(a) ?? a),
      priority: it.priority ?? null,
      created_at: it.created_at ?? null,
      updated_at: it.updated_at ?? null,
      comments: comments.map((c) => ({
        actor: memberName.get(c.actor as string) ?? memberName.get(c.created_by as string) ?? (c.actor ?? c.created_by ?? 'unknown'),
        created_at: c.created_at ?? null,
        comment_html: (c.comment_html ?? c.comment_stripped ?? '') as string,
      })),
    })
    process.stdout.write(`  • AGENTESOPE-${seq} «${String(it.name).slice(0, 40)}» (${comments.length} comments)\n`)
  }

  cards.sort((a, b) => (a.sequence_id as number) - (b.sequence_id as number))

  const stamp = new Date().toISOString().slice(0, 10)
  const jsonPath = resolve(repoRoot, `plane-backup-${stamp}.json`)
  const mdPath = resolve(repoRoot, `plane-backup-${stamp}.md`)

  writeFileSync(jsonPath, JSON.stringify({ workspace: ws, project: proj, exported_at: new Date().toISOString(), count: cards.length, cards }, null, 2), 'utf-8')

  const md: string[] = [`# Plane backup — ${stamp}`, '', `Workspace: ${ws} · Project: ${proj} · Cards: ${cards.length}`, '']
  for (const c of cards) {
    md.push(`## ${c.card_id} — ${c.title}`)
    md.push(`- **Estado:** ${c.state} · **Labels:** ${(c.labels as string[]).join(', ') || '—'} · **Asignado:** ${(c.assignees as string[]).join(', ') || '—'} · **Prioridad:** ${c.priority ?? '—'}`)
    const desc = String(c.description_html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    md.push(`- **Descripción:** ${desc ? desc.slice(0, 500) : '—'}`)
    const cm = c.comments as Array<{ actor: string; comment_html: string }>
    if (cm.length) {
      md.push(`- **Comentarios (${cm.length}):**`)
      for (const x of cm) {
        const txt = String(x.comment_html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        md.push(`  - _${x.actor}_: ${txt.slice(0, 300)}`)
      }
    }
    md.push('')
  }
  writeFileSync(mdPath, md.join('\n'), 'utf-8')

  console.log(`\n✅ Backup escrito:`)
  console.log(`  • ${jsonPath}`)
  console.log(`  • ${mdPath}`)
  console.log(`  Total cards: ${cards.length}`)
  return 0
}

main()
  .then((code) => { process.exitCode = code })
  .catch((e) => { console.error(`❌ ${(e as Error).message}`); process.exitCode = 1 })
