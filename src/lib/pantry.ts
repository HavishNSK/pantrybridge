import { INGREDIENTS, INGREDIENT_BY_ID } from '../data/ingredients'
import type { Ingredient, PantryItem } from '../types'
import { toBase } from './units'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

/** Resolve free text ("canned black beans", "Eggs") to a canonical ingredient. */
export function resolveIngredient(text: string): Ingredient | undefined {
  const q = norm(text)
  if (!q) return undefined
  const exact = INGREDIENTS.find((i) => norm(i.name) === q || i.aliases.some((a) => norm(a) === q))
  if (exact) return exact
  const singular = q.replace(/(es|s)$/, '')
  return INGREDIENTS.find((i) => [i.name, ...i.aliases].some((a) => norm(a).includes(singular) || singular.includes(norm(a))))
}

export function searchIngredients(text: string, limit = 8): Ingredient[] {
  const q = norm(text)
  if (!q) return INGREDIENTS.filter((i) => !i.staple).slice(0, limit)
  return INGREDIENTS.filter((i) => [i.name, ...i.aliases].some((a) => norm(a).includes(q))).slice(0, limit)
}

/** Total on-hand base amount per ingredient id. */
export function stockMap(items: PantryItem[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const it of items) {
    const ing = INGREDIENT_BY_ID[it.ingredientId]
    if (!ing) continue
    const b = toBase(ing, it.quantity, it.unit)
    if (b == null) continue
    out[it.ingredientId] = (out[it.ingredientId] ?? 0) + b
  }
  return out
}

export function daysUntil(iso?: string): number | undefined {
  if (!iso) return undefined
  const ms = new Date(iso + 'T23:59:59').getTime() - Date.now()
  return Math.floor(ms / 86_400_000)
}

export function expiringSoon(items: PantryItem[], withinDays = 7): (PantryItem & { days: number })[] {
  return items
    .map((it) => ({ ...it, days: daysUntil(it.expiresAt) }))
    .filter((it): it is PantryItem & { days: number } => it.days != null && it.days <= withinDays)
    .sort((a, b) => a.days - b.days)
}

/** Merge new items into an existing list, summing quantities for the same ingredient + unit. */
export function mergeItems(existing: PantryItem[], incoming: PantryItem[]): PantryItem[] {
  const out = existing.map((i) => ({ ...i }))
  for (const inc of incoming) {
    const match = out.find((o) => o.ingredientId === inc.ingredientId && o.unit === inc.unit)
    if (match) {
      match.quantity = Math.round((match.quantity + inc.quantity) * 100) / 100
      match.demo = match.demo && inc.demo
      if (inc.expiresAt && (!match.expiresAt || inc.expiresAt < match.expiresAt)) match.expiresAt = inc.expiresAt
    } else out.push({ ...inc })
  }
  return out
}

export function pantryValue(items: PantryItem[]): number {
  const stock = stockMap(items)
  return Object.entries(stock).reduce((sum, [id, base]) => {
    const ing = INGREDIENT_BY_ID[id]
    return sum + (base / (ing.base === 'each' ? 1 : 100)) * ing.pricePerBase
  }, 0)
}
