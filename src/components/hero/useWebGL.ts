import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

let cached: boolean | null = null

function detectWebGL(): boolean {
  if (cached != null) return cached
  try {
    if (typeof window === 'undefined') return false
    if (new URLSearchParams(window.location.search).has('nowebgl')) return (cached = false)
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    cached = !!gl
    // Release the probe context right away so it does not count against the browser's limit.
    ;(gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

/** True when WebGL is available and the URL does not contain `?nowebgl`. */
export function useWebGL(): boolean {
  const [ok] = useState(detectWebGL)
  return ok
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useMemo(() => subscribeMedia(query), [query])
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener('visibilitychange', cb)
  return () => document.removeEventListener('visibilitychange', cb)
}

export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  )
}

/** Resolves once web fonts are ready so canvas labels draw in Archivo instead of a fallback face. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(() => typeof document === 'undefined' || document.fonts?.status === 'loaded')
  useEffect(() => {
    if (ready || !document.fonts) return
    let alive = true
    document.fonts.ready.then(() => alive && setReady(true)).catch(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [ready])
  return ready
}
