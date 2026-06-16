import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * On-demand revalidation endpoint.
 *
 * Called by Payload CMS afterChange hooks after saving a Global or Collection.
 * Requires the REVALIDATE_TOKEN env var to match the `token` query param.
 *
 * Usage:
 *   POST /api/revalidate?token=<REVALIDATE_TOKEN>
 *   Body: { "paths": ["/es", "/pt", "/es/tarifario", ...] }
 *
 * If `paths` is omitted the full public site is revalidated.
 */

const PUBLIC_PATHS = [
  '/',
  '/es',
  '/pt',
  '/es/categorias',
  '/pt/categorias',
  '/es/fechas-de-cierre',
  '/pt/fechas-de-cierre',
  '/es/hall-de-la-fama',
  '/pt/hall-de-la-fama',
  '/es/inscripcion',
  '/pt/inscripcion',
  '/es/jurados',
  '/pt/jurados',
  '/es/premios',
  '/pt/premios',
  '/es/reglamento',
  '/pt/reglamento',
  '/es/tarifario',
  '/pt/tarifario',
  '/es/20-consejos',
  '/pt/20-consejos',
  '/es/ranking',
  '/pt/ranking',
  '/es/ganadores',
  '/pt/ganadores',
  '/sitemap.xml',
]

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const expectedToken = process.env.REVALIDATE_TOKEN

  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, message: 'REVALIDATE_TOKEN not configured.' },
      { status: 500 },
    )
  }

  if (!token || token !== expectedToken) {
    return NextResponse.json(
      { ok: false, message: 'Invalid or missing token.' },
      { status: 401 },
    )
  }

  let paths: string[] = PUBLIC_PATHS

  try {
    const body = await request.json().catch(() => ({}))
    if (Array.isArray(body?.paths) && body.paths.length > 0) {
      paths = body.paths as string[]
    }
  } catch {
    // body parse failed — use default paths
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({ ok: true, revalidated: paths })
}
