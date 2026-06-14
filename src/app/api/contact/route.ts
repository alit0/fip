import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { submitContactMessage } from '@/lib/contact/submitContactMessage'

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  if (!payload) {
    return NextResponse.json({ ok: false, message: 'Servicio no disponible.' }, { status: 503 })
  }

  const result = await submitContactMessage(await request.json(), {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  }, { payload })

  if (!result.ok) {
    const status = result.status === 'rate-limited' ? 429 : 400
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result, { status: 201 })
}
