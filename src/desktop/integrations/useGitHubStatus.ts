import { useEffect, useState } from 'react'
import { useDesktop } from '../DesktopContext'
import type { IntegrationModel, IntegrationStatus } from '../desktop.types'

/**
 * Shared integration-state hooks for the system shell.
 *
 * These report truthful status from real requests:
 *   ONLINE      live request succeeded
 *   CACHED      stale-but-real snapshot served
 *   ERROR       request failed
 *   UNAVAILABLE no data source configured
 *   LOCKED      feature requires authentication
 *
 * We never fabricate connectivity or metrics.
 */

export async function fetchStatusSignal(path: string, timeoutMs = 8000): Promise<{ ok: boolean; asOf?: string }> {
  try {
    const res = await fetch(path, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) return { ok: false }
    const data = await res.json()
    return { ok: true, asOf: data?.asOf }
  } catch {
    return { ok: false }
  }
}

/** Probe the GitHub integration (netlify function). */
export function useGitHubStatus(): { status: IntegrationStatus; detail: string } {
  const { setIntegrations } = useDesktop()
  const [status, setStatus] = useState<IntegrationStatus>('LOADING')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchStatusSignal('/api/github').then(({ ok, asOf }) => {
      if (cancelled) return
      if (ok) {
        const model: IntegrationModel = { id: 'github', label: 'GitHub', status: 'ONLINE', lastUpdated: asOf }
        setStatus('ONLINE')
        setDetail(asOf ? `as of ${asOf}` : 'live')
        setIntegrations({ github: model })
      } else {
        const model: IntegrationModel = { id: 'github', label: 'GitHub', status: 'ERROR' }
        setStatus('ERROR')
        setDetail('refresh failed')
        setIntegrations({ github: model })
      }
    })
    return () => { cancelled = true }
  }, [setIntegrations])

  return { status, detail }
}

/** Static knowledge snapshot — generated at build time, truthful CACHED state. */
export function knowledgeIntegration(): IntegrationModel {
  return { id: 'knowledge', label: 'Knowledge', status: 'CACHED', detail: 'published snapshot' }
}