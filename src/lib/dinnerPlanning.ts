import { DINNER_RECIPE_IDS, RECIPE_BY_ID } from '../data/recipes'
import type { Equipment, PantryItem, WeekPlan } from '../types'
import { analyzePlan } from './planner'
import { matchRecipe, QUANTITY_EPSILON, type RecipeMatch } from './recipeMatching'

export interface CookingPreferences {
  equipment: Equipment[]
  maxMinutes: number
  safeWater: boolean
  noShopping: boolean
  budget: number
}
export const DEFAULT_COOKING_PREFERENCES: CookingPreferences = {
  equipment: [], maxMinutes: 30, safeWater: false, noShopping: true, budget: 0,
}
const EQUIPMENT: Equipment[] = ['pot', 'skillet', 'oven', 'sheet-pan', 'microwave', 'blender', 'none']

export function normalizeCookingPreferences(value: unknown): CookingPreferences {
  const data = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  const equipment = Array.isArray(data.equipment) ? EQUIPMENT.filter(item => data.equipment instanceof Array && data.equipment.includes(item)) : []
  return {
    equipment,
    maxMinutes: typeof data.maxMinutes === 'number' && Number.isFinite(data.maxMinutes) && data.maxMinutes >= 5 && data.maxMinutes <= 240 ? data.maxMinutes : 30,
    safeWater: data.safeWater === true,
    noShopping: data.noShopping !== false,
    budget: typeof data.budget === 'number' && Number.isFinite(data.budget) && data.budget >= 0 && data.budget <= 10000 ? data.budget : 0,
  }
}

function preserveOtherMeals(plan: WeekPlan): WeekPlan {
  return Object.fromEntries(Object.entries(plan).map(([day, slots]) => {
    const { dinner, ...others } = slots
    const previousDinner = plan[Number(day) - 1]?.dinner
    const lunch = others.lunch
    const preservedOthers = lunch?.leftover && Number(day) >= 1 && Number(day) <= 3 && previousDinner?.recipeId === lunch.recipeId
      ? { ...others, lunch: { ...lunch, leftover: false } } : others
    return [day, Number(day) < 3 ? preservedOthers : { ...preservedOthers, ...(dinner ? { dinner: { ...dinner } } : {}) }]
  }))
}

/** Deterministic, bounded search of the curated collection; reserves existing meals first. */
export function suggestDinners(pantry: PantryItem[], plan: WeekPlan, household: number, preferences: CookingPreferences): {
  meals: RecipeMatch[]; plan: WeekPlan; additionalCost: number; preservedCost: number; reason: string; replaced: number
} {
  const prefs = normalizeCookingPreferences(preferences)
  const servings = Number.isInteger(household) && household >= 1 && household <= 12 ? household : 1
  const preserved = preserveOtherMeals(plan)
  const analysis = analyzePlan(preserved, pantry, { safeWater: prefs.safeWater })
  const preservedCost = analysis.additionalCost
  const replaced = [0, 1, 2].filter(day => !!plan[day]?.dinner).length
  const budget = prefs.noShopping ? 0 : prefs.budget
  const blocked = prefs.noShopping ? analysis.shopping.length > 0 : preservedCost > budget + QUANTITY_EPSILON
  if (blocked) return { meals: [], plan: preserved, additionalCost: preservedCost, preservedCost, replaced, reason: 'Preserved meals already require groceries beyond your current purchase limits. Adjust the existing plan or budget first.' }

  const candidates = DINNER_RECIPE_IDS.map(id => RECIPE_BY_ID[id]).filter(recipe => recipe.minutes <= prefs.maxMinutes && recipe.equipment.every(tool => tool === 'none' || prefs.equipment.includes(tool)))
  let best: RecipeMatch[] = []
  let bestCost = preservedCost
  const search = (meals: RecipeMatch[], remaining: Record<string, number>, cost: number) => {
    if (meals.length > best.length || meals.length === best.length && cost < bestCost) { best = meals; bestCost = cost }
    if (meals.length === 3) return
    for (const recipe of candidates) {
      if (meals.some(meal => meal.recipe.id === recipe.id)) continue
      const match = matchRecipe(recipe, remaining, servings, false)
      // Missing water cannot be priced as a free purchase.
      if (match.missingRequired.some(line => line.item.ingredientId === 'water') || prefs.noShopping && !match.canMake) continue
      const nextCost = cost + match.additionalCost
      if (nextCost > budget + QUANTITY_EPSILON) continue
      const next = { ...remaining }
      for (const line of match.lines) if (!line.item.optional) next[line.item.ingredientId] = Math.max(0, (next[line.item.ingredientId] ?? 0) - line.have)
      search([...meals, match], next, nextCost)
    }
  }
  search([], analysis.remaining, preservedCost)
  const nextPlan = { ...preserved }
  best.forEach((meal, day) => { nextPlan[day] = { ...nextPlan[day], dinner: { recipeId: meal.recipe.id, servings } } })
  return {
    meals: best, plan: nextPlan, additionalCost: bestCost, preservedCost, replaced,
    reason: best.length === 3 ? 'Three distinct dinners fit your confirmed stock, tools, time, and purchase limits.' : `${best.length} of three dinners fit. Check quantities, safe cooking water, tools, time, and your total grocery budget. This small curated collection may not cover every possibility.`,
  }
}
