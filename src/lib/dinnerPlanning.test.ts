import { describe, it, expect } from 'vitest'
import { DEFAULT_COOKING_PREFERENCES, normalizeCookingPreferences, suggestDinners } from './dinnerPlanning'
import type { PantryItem } from '../types'
const pantry: PantryItem[] = Object.entries({ rice: 300, 'black-beans': 425, pasta: 300, 'diced-tomatoes': 822, lentils: 240, carrots: 240 }).map(([ingredientId, quantity]) => ({ uid: ingredientId, ingredientId, quantity, unit: 'g', addedAt: '2026-10-25' }))
const prefs = { ...DEFAULT_COOKING_PREFERENCES, equipment: ['pot'] as const as ['pot'], safeWater: true }
describe('three dinners', () => {
  it('normalizes invalid persisted preferences conservatively', () => {
    expect(normalizeCookingPreferences(null)).toEqual(DEFAULT_COOKING_PREFERENCES)
    expect(normalizeCookingPreferences({ equipment: ['pot', 'invalid'], budget: -1, maxMinutes: NaN })).toEqual({ ...DEFAULT_COOKING_PREFERENCES, equipment: ['pot'] })
  })
  it('requires equipment, explicit water and household quantities', () => {
    expect(suggestDinners(pantry, {}, 4, DEFAULT_COOKING_PREFERENCES).meals).toHaveLength(0)
    expect(suggestDinners(pantry, {}, 4, { ...prefs, safeWater: false }).meals).toHaveLength(0)
    expect(suggestDinners(pantry, {}, 4, prefs).meals).toHaveLength(3)
    expect(suggestDinners(pantry, {}, 8, prefs).meals).toHaveLength(0)
    expect(suggestDinners(pantry, {}, 4, { ...prefs, maxMinutes: 25 }).meals).toHaveLength(1)
  })
  it('reserves preserved stock, keeps slots and counts replaced dinners', () => {
    const plan = { 0: { dinner: { recipeId: 'box-bean-rice', servings: 4 } }, 5: { dinner: { recipeId: 'box-bean-rice', servings: 4 } } }
    const result = suggestDinners(pantry, plan, 4, prefs)
    expect(result.meals).toHaveLength(2)
    expect(result.plan[5]).toEqual(plan[5])
    expect(result.replaced).toBe(1)
    expect(plan[0].dinner.recipeId).toBe('box-bean-rice')
  })
  it('charges preserved shopping first and aggregate budget', () => {
    const result = suggestDinners([], { 6: { dinner: { recipeId: 'box-bean-rice', servings: 4 } } }, 4, { ...prefs, noShopping: false, budget: 0.1 })
    expect(result.meals).toHaveLength(0)
    expect(result.preservedCost).toBeGreaterThan(0.1)
    expect(suggestDinners([], {}, 4, { ...prefs, noShopping: false, budget: 100 }).meals).toHaveLength(3)
    expect(suggestDinners([], {}, 4, { ...prefs, noShopping: false, budget: 2 }).additionalCost).toBeLessThanOrEqual(2)
  })
})

describe('boundary and leftover handling', () => {
  it('does not invent free water when shopping is enabled', () => {
    expect(suggestDinners([], {}, 4, { ...prefs, safeWater: false, noShopping: false, budget: 100 }).meals).toHaveLength(0)
  })
  it('reserves ingredients for lunches whose source dinner is replaced', () => {
    const plan = { 0: { dinner: { recipeId: 'box-bean-rice', servings: 8 } }, 1: { lunch: { recipeId: 'box-bean-rice', servings: 4, leftover: true } } }
    const result = suggestDinners(pantry, plan, 4, prefs)
    expect(result.plan[1].lunch).toEqual({ recipeId: 'box-bean-rice', servings: 4, leftover: false })
    expect(result.meals).toHaveLength(2)
  })
  it('normalizes valid bounded preferences and duplicates', () => {
    expect(normalizeCookingPreferences({ equipment: ['pot', 'pot', 'none'], maxMinutes: 240, safeWater: true, noShopping: false, budget: 10000 })).toEqual({ equipment: ['pot', 'none'], maxMinutes: 240, safeWater: true, noShopping: false, budget: 10000 })
    expect(normalizeCookingPreferences({ equipment: false, maxMinutes: -1, budget: Infinity, safeWater: 'true', noShopping: 0 })).toEqual(DEFAULT_COOKING_PREFERENCES)
    expect(suggestDinners(pantry, {}, NaN, prefs).meals[0].servings).toBe(1)
  })
  it('includes preserved deficits in the aggregate result', () => {
    const result = suggestDinners([], { 6: { dinner: { recipeId: 'box-bean-rice', servings: 4 } } }, 4, { ...prefs, noShopping: false, budget: 100 })
    expect(result.meals).toHaveLength(3)
    expect(result.additionalCost).toBeGreaterThan(result.preservedCost)
  })
})
