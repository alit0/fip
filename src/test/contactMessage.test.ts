import { describe, it, expect, vi } from 'vitest'
import { submitContactMessage } from '@/lib/contact/submitContactMessage'

function payloadMock() {
  return { create: vi.fn().mockResolvedValue({ id: 'msg' }) }
}

describe('submitContactMessage', () => {
  it('persists and sends a valid contact message', async () => {
    const payload = payloadMock()
    const sendEmail = vi.fn().mockResolvedValue(undefined)

    const result = await submitContactMessage(
      { nombre: 'Ada', email: 'ADA@EXAMPLE.COM', mensaje: 'Hola FIP' },
      { ip: '127.0.0.1', userAgent: 'vitest' },
      { payload, sendEmail, rateLimitStore: new Map(), now: () => 1 },
    )

    expect(result).toEqual({ ok: true, status: 'sent' })
    expect(sendEmail).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com', message: 'Hola FIP' })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'contact-messages',
      data: expect.objectContaining({ name: 'Ada', email: 'ada@example.com', message: 'Hola FIP', status: 'sent' }),
    }))
  })

  it('rejects honeypot submissions', async () => {
    const payload = payloadMock()
    const sendEmail = vi.fn()

    const result = await submitContactMessage(
      { nombre: 'Bot', email: 'bot@example.com', mensaje: 'spam', website: 'https://spam.test' },
      { ip: '127.0.0.1' },
      { payload, sendEmail, rateLimitStore: new Map(), now: () => 1 },
    )

    expect(result.ok).toBe(false)
    expect(result.status).toBe('spam')
    expect(sendEmail).not.toHaveBeenCalled()
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'spam' }),
    }))
  })

  it('rate limits repeated submissions', async () => {
    const payload = payloadMock()
    const store = new Map<string, number[]>()
    const deps = { payload, sendEmail: vi.fn().mockResolvedValue(undefined), rateLimitStore: store, now: () => 1 }

    for (let i = 0; i < 5; i++) {
      await submitContactMessage({ nombre: 'Ada', email: 'ada@example.com', mensaje: `Hola ${i}` }, { ip: '127.0.0.1' }, deps)
    }

    const result = await submitContactMessage({ nombre: 'Ada', email: 'ada@example.com', mensaje: 'Otra vez' }, { ip: '127.0.0.1' }, deps)

    expect(result.ok).toBe(false)
    expect(result.status).toBe('rate-limited')
  })
})
