import { useEffect, useState } from 'react'

/**
 * Responsive desktop model — breakpoints represent environment changes,
 * not arbitrary device sizes.
 *
 *   large desktop  → multi-window environment
 *   tablet         → reduced workspace (stacked windows, dock always visible)
 *   mobile         → single active application, bottom navigation
 *
 * The architecture is identical; only presentation changes.
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
}
