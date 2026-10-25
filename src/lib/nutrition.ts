import { INGREDIENT_BY_ID } from '../data/ingredients'
import type { MealSlot, PantryItem } from '../types'
import { stockMap } from './pantry'
import { SLOTS, type PlanAnalysis } from './planner'
import type { RecipeMatch } from './recipeMatching'

export interface NutritionSummary {
  daysPlanned: number
  /** per person, per planned day */
  proteinPerDay: number
  fiberPerDay: number
  kcalPerDay: number
  produceVariety: string[]
  utilization: number
  usedIngredientIds: string[]
  unusedIngredientIds: string[]
  mealsTotal: number
  mealsFromPantry: number
}

/**
 * Who eats what: a cooked meal's servings minus any leftover entries drawn from it,
 * and each leftover entry with the nutrition of the cooked meal it came from.
 */
const order = (m: { day: number; slot: MealSlot }) => m.day * 3 + SLOTS.indexOf(m.slot)

export function eatenMeals(analysis: PlanAnalysis): { day: number; servings: number; match: RecipeMatch }[] {
  const out: { day: number; servings: number; match: RecipeMatch }[] = []
  const cooked = analysis.meals.filter((m) => m.match)
  for (const meal of analysis.meals) {
    if (meal.match) {
      const later = analysis.meals.filter((l) => l.entry.leftover && l.entry.recipeId === meal.entry.recipeId && sourceOf(l) === meal)
      const carried = later.reduce((n, l) => n + l.entry.servings, 0)
      out.push({ day: meal.day, servings: Math.max(0, meal.entry.servings - carried), match: meal.match })
    } else {
      const src = sourceOf(meal)
      if (src?.match) out.push({ day: meal.day, servings: meal.entry.servings, match: src.match })
    }
  }
  return out

  function sourceOf(leftover: PlanAnalysis['meals'][number]) {
    // The most recent cooked meal of the same recipe earlier in the week (an earlier day, or earlier slot that day).
    const at = order(leftover)
    return [...cooked].reverse().find((c) => c.entry.recipeId === leftover.entry.recipeId && order(c) < at)
  }
}

export function summarize(analysis: PlanAnalysis, pantry: PantryItem[], household: number): NutritionSummary {
  const days = new Set(analysis.meals.map((m) => m.day))
  const totals = { protein: 0, fiber: 0, kcal: 0 }
  const produce = new Set<string>()
  const used = new Set<string>()
  for (const eaten of eatenMeals(analysis)) {
    const s = eaten.servings
    totals.protein += eaten.match.perServing.protein * s
    totals.fiber += eaten.match.perServing.fiber * s
    totals.kcal += eaten.match.perServing.kcal * s
  }
  for (const meal of analysis.meals) {
    const source = meal.match
    if (!source) continue
    for (const l of source.lines) {
      const ing = INGREDIENT_BY_ID[l.item.ingredientId]
      if ((ing.vegetable || ing.fruit) && (!l.item.optional || l.have >= l.need)) produce.add(ing.id)
      if (l.have > 0 && !ing.staple) used.add(ing.id)
    }
  }
  const stocked = Object.keys(stockMap(pantry)).filter((id) => !INGREDIENT_BY_ID[id].staple)
  const personDays = Math.max(1, days.size) * Math.max(1, household)
  return {
    daysPlanned: days.size,
    proteinPerDay: totals.protein / personDays,
    fiberPerDay: totals.fiber / personDays,
    kcalPerDay: totals.kcal / personDays,
    produceVariety: [...produce],
    utilization: stocked.length ? stocked.filter((id) => used.has(id)).length / stocked.length : 0,
    usedIngredientIds: stocked.filter((id) => used.has(id)),
    unusedIngredientIds: stocked.filter((id) => !used.has(id)),
    mealsTotal: analysis.meals.length,
    mealsFromPantry: analysis.fromPantryCount,
  }
}
