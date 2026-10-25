import { INGREDIENT_BY_ID } from '../data/ingredients'
import { SUBSTITUTIONS } from '../data/recipes'
import type { Recipe, RecipeIngredient } from '../types'
import { toBase } from './units'

export type FilterId = 'only-mine' | 'lowest-cost' | 'protein' | 'veg' | 'quick' | 'minimal-equipment' | 'family'

export const FILTERS: { id: FilterId; label: string; hint: string }[] = [
  { id: 'only-mine', label: 'Use only my ingredients', hint: 'Every required ingredient is in your pantry in enough quantity' },
  { id: 'lowest-cost', label: 'Lowest additional cost', hint: 'Sorted by what you would still need to buy' },
  { id: 'protein', label: 'Higher protein', hint: '15 g or more protein per serving (estimate)' },
  { id: 'veg', label: 'More vegetables', hint: 'About 2+ servings of vegetables or fruit per portion' },
  { id: 'quick', label: 'Quick meals', hint: '25 minutes or less' },
  { id: 'minimal-equipment', label: 'Minimal equipment', hint: 'One pot, pan, or no cooking at all' },
  { id: 'family', label: 'Family-sized', hint: 'Makes 4 or more servings' },
]

export interface LineMatch {
  item: RecipeIngredient
  need: number
  have: number
  missing: number
  missingCost: number
  staple: boolean
}

export interface RecipeMatch {
  recipe: Recipe
  servings: number
  lines: LineMatch[]
  /** fraction of required (non-optional, non-staple) ingredients fully on hand */
  coverage: number
  canMake: boolean
  missingRequired: LineMatch[]
  additionalCost: number
  totalCost: number
  costPerServing: number
  perServing: { kcal: number; protein: number; fiber: number }
  vegServings: number
}

const per100 = (base: number) => base / 100

export function lineBase(item: RecipeIngredient, scale: number): number {
  const ing = INGREDIENT_BY_ID[item.ingredientId]
  return (toBase(ing, item.quantity, item.unit) ?? 0) * scale
}

/** Deterministically match a recipe against on-hand stock (base units). */
export function matchRecipe(recipe: Recipe, stock: Record<string, number>, servings = recipe.servings): RecipeMatch {
  const scale = servings / recipe.servings
  const remaining = { ...stock }
  const lines: LineMatch[] = recipe.ingredients.map((item) => {
    const ing = INGREDIENT_BY_ID[item.ingredientId]
    const need = lineBase(item, scale)
    const staple = !!ing.staple
    const avail = staple ? need : Math.max(0, remaining[item.ingredientId] ?? 0)
    const have = Math.min(avail, need)
    if (!staple) remaining[item.ingredientId] = avail - have
    const missing = Math.max(0, need - have)
    return { item, need, have, missing, staple, missingCost: per100(missing) * ing.pricePerBase }
  })

  const required = lines.filter((l) => !l.item.optional && !l.staple)
  const missingRequired = required.filter((l) => l.missing > 0.5)
  const coverage = required.length ? (required.length - missingRequired.length) / required.length : 1
  const additionalCost = missingRequired.reduce((s, l) => s + l.missingCost, 0)
  const totalCost = lines.filter((l) => !l.item.optional).reduce((s, l) => s + per100(l.need) * INGREDIENT_BY_ID[l.item.ingredientId].pricePerBase, 0)

  // Nutrition: required ingredients plus optional ones the household actually has.
  const counted = lines.filter((l) => !l.item.optional || l.have >= l.need)
  const sum = { kcal: 0, protein: 0, fiber: 0 }
  let produceGrams = 0
  for (const l of counted) {
    const ing = INGREDIENT_BY_ID[l.item.ingredientId]
    const f = per100(l.need)
    sum.kcal += ing.nutrition.kcal * f
    sum.protein += ing.nutrition.protein * f
    sum.fiber += ing.nutrition.fiber * f
    if (ing.vegetable || ing.fruit) produceGrams += l.need
  }

  return {
    recipe, servings, lines, coverage, canMake: missingRequired.length === 0, missingRequired,
    additionalCost, totalCost, costPerServing: totalCost / servings,
    perServing: { kcal: sum.kcal / servings, protein: sum.protein / servings, fiber: sum.fiber / servings },
    // ~80 g is a common reference portion of vegetables or fruit.
    vegServings: produceGrams / servings / 80,
  }
}

export function minimalEquipment(r: Recipe): boolean {
  return r.equipment.filter((e) => e !== 'none').length <= 1
}

export function applyFilters(matches: RecipeMatch[], active: Set<FilterId>, query = ''): RecipeMatch[] {
  const q = query.trim().toLowerCase()
  let out = matches.filter((m) => {
    if (q && !(m.recipe.name.toLowerCase().includes(q) || m.recipe.ingredients.some((i) => INGREDIENT_BY_ID[i.ingredientId].name.toLowerCase().includes(q)))) return false
    if (active.has('only-mine') && !m.canMake) return false
    if (active.has('protein') && m.perServing.protein < 15) return false
    if (active.has('veg') && m.vegServings < 2) return false
    if (active.has('quick') && m.recipe.minutes > 25) return false
    if (active.has('minimal-equipment') && !minimalEquipment(m.recipe)) return false
    if (active.has('family') && m.recipe.servings < 4) return false
    return true
  })
  out = [...out].sort((a, b) => {
    if (active.has('lowest-cost')) return a.additionalCost - b.additionalCost || b.coverage - a.coverage
    if (active.has('protein')) return b.perServing.protein - a.perServing.protein
    if (active.has('veg')) return b.vegServings - a.vegServings
    return b.coverage - a.coverage || a.additionalCost - b.additionalCost
  })
  return out
}

/** Substitutions for missing ingredients, only where the substitute is on hand. */
export function substitutionsFor(m: RecipeMatch, stock: Record<string, number>): { from: string; to: string; note: string }[] {
  const out: { from: string; to: string; note: string }[] = []
  for (const l of m.lines) {
    if (l.missing <= 0.5 || l.staple) continue
    const sub = SUBSTITUTIONS.find((s) => s.from === l.item.ingredientId)
    const to = sub?.to.find((id) => (stock[id] ?? 0) > 0 || INGREDIENT_BY_ID[id]?.staple)
    if (sub && to) out.push({ from: l.item.ingredientId, to, note: sub.note })
  }
  return out
}
