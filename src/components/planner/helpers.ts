import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { iterPlan, SLOTS, type PlanAnalysis, type PlannedMeal } from '../../lib/planner'
import { displayAmount, formatQty } from '../../lib/units'
import type { MealSlot, WeekPlan } from '../../types'

export const SLOT_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

export function amountText(ingredientId: string, base: number): string {
  const ing = INGREDIENT_BY_ID[ingredientId]
  if (!ing) return ''
  const { qty, unit } = displayAmount(ing, base)
  return formatQty(qty, unit)
}

export function findMeal(analysis: PlanAnalysis, day: number, slot: MealSlot): PlannedMeal | undefined {
  return analysis.meals.find((m) => m.day === day && m.slot === slot)
}

export function withoutSlot(plan: WeekPlan, day: number, slot: MealSlot): WeekPlan {
  const dayPlan = { ...(plan[day] ?? {}) }
  delete dayPlan[slot]
  return { ...plan, [day]: dayPlan }
}

/** Local YYYY-MM-DD (toISOString would shift dates near midnight). */
export function localIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the textarea fallback
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

const order = (day: number, slot: MealSlot) => day * 3 + SLOTS.indexOf(slot)

export function isEarlier(a: { day: number; slot: MealSlot }, b: { day: number; slot: MealSlot }): boolean {
  return order(a.day, a.slot) < order(b.day, b.slot)
}

/** The cooked meal a leftover comes from: the nearest earlier non-leftover entry of the same recipe. */
export function leftoverSource(plan: WeekPlan, day: number, slot: MealSlot, recipeId: string): { day: number; slot: MealSlot; servings: number } | null {
  let found: { day: number; slot: MealSlot; servings: number } | null = null
  for (const m of iterPlan(plan)) {
    if (!isEarlier(m, { day, slot })) break
    if (!m.entry.leftover && m.entry.recipeId === recipeId) found = { day: m.day, slot: m.slot, servings: m.entry.servings }
  }
  return found
}

/** Servings of a source meal not yet taken by other leftover entries (excluding the given slot). */
export function leftoverAvailable(plan: WeekPlan, source: { day: number; slot: MealSlot; servings: number }, recipeId: string, exclude?: { day: number; slot: MealSlot }): number {
  let taken = 0
  for (const m of iterPlan(plan)) {
    if (!m.entry.leftover || m.entry.recipeId !== recipeId) continue
    if (exclude && m.day === exclude.day && m.slot === exclude.slot) continue
    const src = leftoverSource(plan, m.day, m.slot, recipeId)
    if (src && src.day === source.day && src.slot === source.slot) taken += m.entry.servings
  }
  return Math.max(0, source.servings - taken)
}
