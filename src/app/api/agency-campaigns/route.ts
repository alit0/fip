import { headers as nextHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

async function getAgencyUser(request: Request) {
  const payload = await getPayloadClient()
  if (!payload) return { payload: null, user: null }

  let sessionUser: unknown = null
  try {
    const result = await payload.auth({
      headers: (await nextHeaders()) as unknown as Headers,
    })
    sessionUser = result.user
  } catch {
    return { payload, user: null }
  }

  const u = sessionUser as { id?: string | number; email?: string; role?: string } | null
  if (!u || u.role !== 'agency') return { payload, user: null }

  return { payload, user: { id: String(u.id), email: u.email ?? '', role: 'agency' as const } }
}

export async function POST(request: Request) {
  const { payload, user } = await getAgencyUser(request)

  if (!payload) {
    return NextResponse.json({ ok: false, message: 'Service unavailable.' }, { status: 503 })
  }
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  const { campaignName, company, description, categories, videoUrl, laminaUrl, edition, status } = body

  if (!campaignName || !company || !description) {
    return NextResponse.json(
      { ok: false, message: 'campaignName, company, and description are required.' },
      { status: 400 },
    )
  }

  // Agency can only set status to 'draft' or 'submitted'
  const resolvedStatus = status === 'submitted' ? 'submitted' : 'draft'

  const doc = await payload.create({
    collection: 'agency-campaigns',
    data: {
      submittedBy: user.id,
      edition: edition as string | undefined,
      campaignName: campaignName as string,
      company: company as string,
      description: description as string,
      categories: Array.isArray(categories) ? (categories as string[]) : [],
      videoUrl: (videoUrl as string | undefined) ?? '',
      laminaUrl: (laminaUrl as string | undefined) ?? '',
      status: resolvedStatus,
      paymentStatus: 'pending',
    },
  })

  return NextResponse.json({ ok: true, id: doc.id, status: doc.status }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { payload, user } = await getAgencyUser(request)

  if (!payload) {
    return NextResponse.json({ ok: false, message: 'Service unavailable.' }, { status: 503 })
  }
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ ok: false, message: 'Missing ?id= query parameter.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
  }

  // Verify ownership: agency may only update their own campaigns
  const existing = await payload.findByID({
    collection: 'agency-campaigns',
    id,
  })

  const ownerId =
    existing.submittedBy && typeof existing.submittedBy === 'object'
      ? String((existing.submittedBy as { id: string | number }).id)
      : String(existing.submittedBy)

  if (ownerId !== user.id) {
    return NextResponse.json({ ok: false, message: 'Forbidden.' }, { status: 403 })
  }

  const { campaignName, company, description, categories, videoUrl, laminaUrl, status } = body

  // Agency can only move status to 'submitted' (or keep as draft); no other transitions
  const resolvedStatus = status === 'submitted' ? 'submitted' : undefined

  const updateData: Record<string, unknown> = {}
  if (campaignName !== undefined) updateData.campaignName = campaignName
  if (company !== undefined) updateData.company = company
  if (description !== undefined) updateData.description = description
  if (categories !== undefined) updateData.categories = categories
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl
  if (laminaUrl !== undefined) updateData.laminaUrl = laminaUrl
  if (resolvedStatus !== undefined) updateData.status = resolvedStatus

  const updated = await payload.update({
    collection: 'agency-campaigns',
    id,
    data: updateData,
  })

  return NextResponse.json({ ok: true, id: updated.id, status: updated.status })
}
