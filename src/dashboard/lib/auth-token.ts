/**
 * The dashboard uses the same password for two purposes:
 *   1. `/api/auth` verification (drives the UI gate).
 *   2. A server-side auth token for privileged API endpoints (e.g. `/api/amli`).
 *
 * To avoid sending the plaintext password around, the client stores only
 * `sha256(password)` in sessionStorage after a successful unlock and sends
 * that as the `X-Dashboard-Auth` header. The server compares it in constant time
 * against `sha256(DASHBOARD_PASSWORD)`.
 */

const AUTH_TOKEN_KEY = 'dashboard-auth-token'

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Non-secure-context fallback (dev on plain http): simple djb2 xorshift is
  // NOT cryptographic — but this fallback only runs where crypto.subtle is
  // unavailable, and the server will reject the token anyway.
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  const a = (h1 ^ h2) >>> 0
  const b = Math.imul(h2 ^ (h1 << 1), 2246822507) >>> 0
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0')
}

export function storeDashboardAuthToken(password: string): Promise<void> {
  return sha256Hex(password).then((token) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  })
}

export function getDashboardAuthToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearDashboardAuthToken(): void {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

/** Headers to attach to privileged dashboard API calls, if authenticated. */
export function dashboardAuthHeaders(): Record<string, string> {
  const token = getDashboardAuthToken()
  return token ? { 'X-Dashboard-Auth': token } : {}
}