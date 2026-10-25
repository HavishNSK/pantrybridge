import type { Ingredient, Unit } from '../types'

const MASS: Partial<Record<Unit, number>> = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 }
const VOLUME: Partial<Record<Unit, number>> = { ml: 1, l: 1000, cup: 240, tbsp: 15, tsp: 5, oz: 29.57 }

export const UNITS: Unit[] = ['each', 'can', 'g', 'kg', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'ml', 'l', 'dozen', 'loaf', 'bunch']

export const UNIT_LABEL: Record<Unit, string> = {
  g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', ml: 'ml', l: 'L', cup: 'cup', tbsp: 'tbsp', tsp: 'tsp',
  can: 'can', each: 'each', dozen: 'dozen', loaf: 'loaf', bunch: 'bunch',
}

/** Convert a quantity to the ingredient's base measure (g or ml). Returns null when no conversion is known. */
export function toBase(ing: Ingredient, quantity: number, unit: Unit): number | null {
  const per = ing.gramsPer?.[unit]
  if (per != null) return quantity * per
  if (ing.base === 'g' && MASS[unit] != null) return quantity * MASS[unit]!
  if (ing.base === 'ml' && VOLUME[unit] != null) return quantity * VOLUME[unit]!
  // Liquids weighed or solids measured by volume: approximate 1 g ≈ 1 ml.
  if (ing.base === 'g' && VOLUME[unit] != null && unit !== 'oz') return quantity * VOLUME[unit]!
  if (ing.base === 'ml' && MASS[unit] != null) return quantity * MASS[unit]!
  return null
}

/** Convert a base amount back into a given unit (inverse of toBase). */
export function fromBase(ing: Ingredient, base: number, unit: Unit): number | null {
  const one = toBase(ing, 1, unit)
  return one ? base / one : null
}

export function unitsFor(ing: Ingredient): Unit[] {
  return UNITS.filter((u) => toBase(ing, 1, u) != null)
}

/** Pick a friendly unit + rounded value for displaying a base amount. */
export function displayAmount(ing: Ingredient, base: number, prefer?: Unit): { qty: number; unit: Unit } {
  const candidates: Unit[] = [prefer ?? ing.defaultUnit, ing.defaultUnit, ing.base === 'ml' ? 'cup' : 'oz', ing.base === 'ml' ? 'ml' : 'g']
  for (const u of candidates) {
    const q = fromBase(ing, base, u)
    if (q != null && q >= 0.25) return { qty: roundNice(q), unit: u }
  }
  return { qty: Math.round(base), unit: ing.base === 'ml' ? 'ml' : 'g' }
}

export function roundNice(n: number): number {
  if (n >= 20) return Math.round(n)
  if (n >= 3) return Math.round(n * 2) / 2
  return Math.round(n * 4) / 4
}

export function formatQty(qty: number, unit: Unit): string {
  const q = Number.isInteger(qty) ? String(qty) : fraction(qty)
  const label = UNIT_LABEL[unit]
  const plural = qty > 1 && ['can', 'cup', 'loaf', 'bunch'].includes(unit) ? (unit === 'loaf' ? 'loaves' : label + 's') : label
  return unit === 'each' ? q : `${q} ${plural}`
}

function fraction(n: number): string {
  const whole = Math.floor(n)
  const rest = n - whole
  const map: [number, string][] = [[0.25, '¼'], [0.5, '½'], [0.75, '¾']]
  const hit = map.find(([v]) => Math.abs(v - rest) < 0.01)
  if (hit) return whole ? `${whole}${hit[1]}` : hit[1]
  return n.toFixed(1)
}
