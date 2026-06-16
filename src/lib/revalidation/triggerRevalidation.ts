/**
 * Calls the /api/revalidate endpoint from inside a Payload afterChange hook.
 *
 * The hook runs server-side inside Payload's Node process, so we call the
 * Next.js API route over HTTP (localhost) rather than importing revalidatePath
 * directly (which is only available in Next.js RSC / route handler scope).
 *
 * REVALIDATE_TOKEN and NEXT_PUBLIC_SITE_URL (or SITE_URL) must be set.
 */
export async function triggerRevalidation(paths?: string[]): Promise<void> {
  const token = process.env.REVALIDATE_TOKEN
  const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

  if (!token) {
    console.warn('[revalidation] REVALIDATE_TOKEN not set — skipping revalidation.')
    return
  }

  const url = `${siteUrl}/api/revalidate?token=${encodeURIComponent(token)}`

  try {
    const body = paths && paths.length > 0 ? JSON.stringify({ paths }) : undefined
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      // Avoid hanging indefinitely inside a CMS save
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.warn(`[revalidation] Endpoint returned ${res.status}: ${await res.text()}`)
    }
  } catch (err) {
    console.warn(`[revalidation] Failed to trigger revalidation: ${(err as Error).message}`)
  }
}
