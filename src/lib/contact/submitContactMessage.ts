type ContactPayload = {
  create: (args: {
    collection: 'contact-messages'
    data: Record<string, unknown>
  }) => Promise<unknown>
}

type ContactInput = {
  nombre?: unknown
  email?: unknown
  mensaje?: unknown
  website?: unknown
}

type SubmitContext = {
  ip?: string
  userAgent?: string
}

type SubmitDeps = {
  payload: ContactPayload
  now?: () => number
  sendEmail?: (message: { name: string; email: string; message: string }) => Promise<void>
  rateLimitStore?: Map<string, number[]>
}

export type SubmitContactResult =
  | { ok: true; status: 'sent' | 'stored' }
  | { ok: false; status: 'invalid' | 'spam' | 'rate-limited'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5
const defaultRateLimitStore = new Map<string, number[]>()

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function rateLimit(key: string, now: number, store: Map<string, number[]>): boolean {
  const fresh = (store.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS)
  if (fresh.length >= MAX_REQUESTS) {
    store.set(key, fresh)
    return false
  }

  fresh.push(now)
  store.set(key, fresh)
  return true
}

export async function sendResendEmail(message: {
  name: string
  email: string
  message: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const to = process.env.CONTACT_TO_EMAIL ?? process.env.RESEND_TO_EMAIL ?? 'info@fipfestival.com.ar'
  const from = process.env.RESEND_FROM_EMAIL ?? 'FIP Festival <onboarding@resend.dev>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: message.email,
      subject: `Nuevo mensaje de contacto — ${message.name}`,
      text: `Nombre: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend failed with HTTP ${res.status}`)
  }
}

export async function submitContactMessage(
  input: ContactInput,
  context: SubmitContext,
  deps: SubmitDeps,
): Promise<SubmitContactResult> {
  const name = asString(input.nombre)
  const email = asString(input.email).toLowerCase()
  const message = asString(input.mensaje)
  const honeypot = asString(input.website)

  if (honeypot) {
    await deps.payload.create({
      collection: 'contact-messages',
      data: { name: name || 'spam', email: email || 'spam@example.com', message: '[honeypot]', status: 'spam', source: 'contact-form', ip: context.ip, userAgent: context.userAgent },
    })
    return { ok: false, status: 'spam', message: 'Spam rejected.' }
  }

  if (!name || !email || !message) {
    return { ok: false, status: 'invalid', message: 'Por favor completá todos los campos.' }
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, status: 'invalid', message: 'Ingresá un email válido.' }
  }

  const key = `${context.ip ?? 'unknown'}:${email}`
  const allowed = rateLimit(key, deps.now?.() ?? Date.now(), deps.rateLimitStore ?? defaultRateLimitStore)
  if (!allowed) {
    return { ok: false, status: 'rate-limited', message: 'Demasiados intentos. Probá más tarde.' }
  }

  let status: 'sent' | 'stored' = 'stored'
  let emailError: string | undefined

  try {
    await (deps.sendEmail ?? sendResendEmail)({ name, email, message })
    status = process.env.RESEND_API_KEY || deps.sendEmail ? 'sent' : 'stored'
  } catch (err) {
    emailError = (err as Error).message
  }

  await deps.payload.create({
    collection: 'contact-messages',
    data: {
      name,
      email,
      message,
      status: emailError ? 'failed' : status,
      source: 'contact-form',
      ip: context.ip,
      userAgent: context.userAgent,
      emailError,
    },
  })

  return { ok: true, status }
}
