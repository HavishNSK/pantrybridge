/** Local-calendar ISO date (YYYY-MM-DD), so "today" matches the user's wall clock. */
export function localIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function isoInDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return localIso(d)
}

/** Expiry prefill from typical shelf life; skipped for items that effectively never expire. */
export function prefillExpiry(shelfDays: number): string {
  return shelfDays > 0 && shelfDays < 3650 ? isoInDays(shelfDays) : ''
}

export function daysLabel(days: number): string {
  if (days < 0) return 'Date passed'
  if (days === 0) return 'Use today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export const rowDomId = (uid: string) => `pantry-row-${uid}`

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
