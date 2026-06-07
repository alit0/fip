import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

let cached: Payload | null = null
let initError = false
let warned = false

const isDev = process.env.NODE_ENV === 'development'

function warnOnce(msg: string): void {
  if (process.env.NODE_ENV === 'test') return
  if (warned) return
  warned = true
  console.warn(msg)
}

/**
 * Returns a Payload local API client, or null if the DB is unavailable.
 *
 * - Caches the client on first success.
 * - In development: allows retry after failure (DB may start after Next).
 * - In production / build / test: does not retry after first failure (avoid spam).
 * - Never logs in test mode.
 */
export async function getPayloadClient(): Promise<Payload | null> {
  if (cached) return cached

  // production / build / test: no retry after confirmed failure
  if (initError && !isDev) return null

  try {
    cached = await getPayload({ config })
    return cached
  } catch (e) {
    initError = true
    warnOnce(
      `[payload] DB unavailable, falling back to mocks: ${(e as Error).message}`,
    )
    return null
  }
}
