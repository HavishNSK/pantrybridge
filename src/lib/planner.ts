import { INGREDIENT_BY_ID } from '../data/ingredients'
import { RECIPES, RECIPE_BY_ID } from '../data/recipes'
import type { Budget, MealSlot, PantryItem, PlanEntry, WeekPlan } from '../types'
import { daysUntil, stockMap } from './pantry'
import { matchRecipe, QUANTITY_EPSILON, type RecipeMatch } from './recipeMatching'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

export interface PlannedMeal {
  day: number
  slot: MealSlot
  entry: PlanEntry
  match: RecipeMatch | null
}

export interface ShoppingLine {
  ingredientId: string
  base: number
  cost: number
  forRecipes: string[]
}

export interface PlanAnalysis {
  meals: PlannedMeal[]
  remaining: Record<string, number>
  shopping: ShoppingLine[]
  additionalCost: number
  fromPantryCount: number
  /** base amounts of soon-expiring items the plan uses */
  rescued: { ingredientId: string; base: number; value: number }[]
}

export function iterPlan(plan: WeekPlan): { day: number; slot: MealSlot; entry: PlanEntry }[] {
  const out: { day: number; slot: MealSlot; entry: PlanEntry }[] = []
  for (let day = 0; day < 7; day++) for (const slot of SLOTS) {
    const entry = plan[day]?.[slot]
    if (entry && RECIPE_BY_ID[entry.recipeId]) out.push({ day, slot, entry })
  }
  return out
}

/** Walk the week in order, drawing each meal's ingredients from what is left in the pantry. */
export function analyzePlan(plan: WeekPlan, pantry: PantryItem[], resources: { safeWater?: boolean } = {}): PlanAnalysis {
  const start: Record<string, number> = { ...stockMap(pantry), ...(resources.safeWater ? { water: Number.MAX_SAFE_INTEGER } : {}) }
  const remaining = { ...start }
  const shopping = new Map<string, ShoppingLine>()
  const meals: PlannedMeal[] = []
  let fromPantryCount = 0

  for (const { day, slot, entry } of iterPlan(plan)) {
    if (entry.leftover) {
      meals.push({ day, slot, entry, match: null })
      fromPantryCount++
      continue
    }
    const recipe = RECIPE_BY_ID[entry.recipeId]
    const match = matchRecipe(recipe, remaining, entry.servings, false)
    for (const l of match.lines) {
      remaining[l.item.ingredientId] = Math.max(0, (remaining[l.item.ingredientId] ?? 0) - l.have)
      if (l.missing > QUANTITY_EPSILON && !l.item.optional) {
        const cur = shopping.get(l.item.ingredientId) ?? { ingredientId: l.item.ingredientId, base: 0, cost: 0, forRecipes: [] }
        cur.base += l.missing
        cur.cost += l.missingCost
        if (!cur.forRecipes.includes(recipe.name)) cur.forRecipes.push(recipe.name)
        shopping.set(l.item.ingredientId, cur)
      }
    }
    if (match.canMake) fromPantryCount++
    meals.push({ day, slot, entry, match })
  }

  const soon = new Set(pantry.filter((p) => (daysUntil(p.expiresAt) ?? 99) <= 7).map((p) => p.ingredientId))
  const rescued = [...soon]
    .map((id) => {
      const used = Math.max(0, (start[id] ?? 0) - (remaining[id] ?? 0))
      return { ingredientId: id, base: used, value: (used / 100) * INGREDIENT_BY_ID[id].pricePerBase }
    })
    .filter((r) => r.base > 0)

  const list = [...shopping.values()].sort((a, b) => INGREDIENT_BY_ID[a.ingredientId].category.localeCompare(INGREDIENT_BY_ID[b.ingredientId].category))
  return { meals, remaining, shopping: list, additionalCost: list.reduce((s, l) => s + l.cost, 0), fromPantryCount, rescued }
}

/**
 * Greedy week builder: favors meals the pantry already covers, soon-expiring
 * ingredients, protein and fiber, low added cost, and variety. Extra dinner
 * servings become next-day lunches.
 */
export function suggestWeek(pantry: PantryItem[], household: number, opts: { maxAddedPerMeal?: number } = {}): WeekPlan {
  const plan: WeekPlan = {}
  const remaining = stockMap(pantry)
  const soon = new Set(pantry.filter((p) => (daysUntil(p.expiresAt) ?? 99) <= 5).map((p) => p.ingredientId))
  const used = new Map<string, number>()
  let leftoverFrom: { recipeId: string; servings: number } | null = null

  const pick = (slot: MealSlot, day: number): RecipeMatch | null => {
    let best: { m: RecipeMatch; score: number } | null = null
    for (const r of RECIPES) {
      if (!r.meal.includes(slot)) continue
      const m = matchRecipe(r, remaining, Math.max(household, slot === 'dinner' ? r.servings : household), false)
      if (opts.maxAddedPerMeal != null && m.additionalCost > opts.maxAddedPerMeal) continue
      const usesSoon = m.lines.filter((l) => soon.has(l.item.ingredientId) && l.have > 0).length
      const repeats = used.get(r.id) ?? 0
      const score =
        m.coverage * 4 + (m.canMake ? 2 : 0) + usesSoon * (day < 3 ? 1.6 : 0.8) +
        Math.min(m.perServing.protein, 30) / 12 + Math.min(m.perServing.fiber, 12) / 6 +
        Math.min(m.vegServings, 3) * 0.4 - m.additionalCost / 2.5 - repeats * 3
      if (!best || score > best.score) best = { m, score }
    }
    return best?.m ?? null
  }

  for (let day = 0; day < 7; day++) {
    // Keep a leftover lunch carried over from yesterday's dinner.
    plan[day] = { ...(plan[day] ?? {}) }
    for (const slot of ['breakfast', 'dinner'] as MealSlot[]) {
      const m = pick(slot, day)
      if (!m) continue
      plan[day][slot] = { recipeId: m.recipe.id, servings: m.servings }
      used.set(m.recipe.id, (used.get(m.recipe.id) ?? 0) + 1)
      for (const l of m.lines) remaining[l.item.ingredientId] = Math.max(0, (remaining[l.item.ingredientId] ?? 0) - l.have)
      if (slot === 'dinner') leftoverFrom = m.servings - household >= household ? { recipeId: m.recipe.id, servings: household } : null
    }
    // Lunch tomorrow from tonight's extra servings.
    if (leftoverFrom && day < 6) {
      plan[day + 1] = { ...(plan[day + 1] ?? {}), lunch: { recipeId: leftoverFrom.recipeId, servings: leftoverFrom.servings, leftover: true } }
    }
  }
  return plan
}

/** Cheaper alternatives for meals that add cost, priced against the pantry as it stands when that meal is cooked. */
export function cheaperSwaps(plan: WeekPlan, pantry: PantryItem[]) {
  const swaps: { day: number; slot: MealSlot; from: string; to: string; saves: number }[] = []
  const remaining = stockMap(pantry)
  for (const { day, slot, entry } of iterPlan(plan)) {
    if (entry.leftover) continue
    const before = { ...remaining }
    const current = matchRecipe(RECIPE_BY_ID[entry.recipeId], before, entry.servings, false)
    for (const l of current.lines) remaining[l.item.ingredientId] = Math.max(0, (remaining[l.item.ingredientId] ?? 0) - l.have)
    if (current.additionalCost < 0.5) continue
    let best: { id: string; cost: number } | null = null
    for (const r of RECIPES) {
      if (r.id === entry.recipeId || !r.meal.includes(slot)) continue
      const m = matchRecipe(r, before, entry.servings, false)
      if (m.additionalCost < current.additionalCost - 0.5 && (!best || m.additionalCost < best.cost)) best = { id: r.id, cost: m.additionalCost }
    }
    if (best) swaps.push({ day, slot, from: entry.recipeId, to: best.id, saves: current.additionalCost - best.cost })
  }
  return swaps.sort((a, b) => b.saves - a.saves).slice(0, 4)
}

export function budgetPace(budget: Budget | null) {
  if (!budget || budget.amount <= 0) return null
  const start = new Date(budget.start + 'T00:00:00').getTime()
  const end = new Date(budget.end + 'T23:59:59').getTime()
  const days = Math.max(1, Math.round((end - start) / 86_400_000))
  const perWeek = (budget.amount / days) * 7
  return { days, perWeek: Math.min(perWeek, budget.amount), perDay: budget.amount / days }
}

export function plannedCount(plan: WeekPlan): number {
  return iterPlan(plan).length
}
