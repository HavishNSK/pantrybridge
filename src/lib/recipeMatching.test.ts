import { describe, expect, it } from 'vitest'
import { matchRecipe } from './recipeMatching'
import { RECIPES } from '../data/recipes'

describe('strict ingredient matching', () => {
  it('requires staples including zero-price seasonings', () => {
    const recipe = RECIPES.find(r => r.id === 'black-bean-chili')!
    expect(matchRecipe(recipe, {}).missingRequired.map(l => l.item.ingredientId)).toContain('oil')
    expect(matchRecipe(recipe, {}).missingRequired.map(l => l.item.ingredientId)).toContain('spices')
  })
  it('reserves required stock before optional lines and omits incomplete optional amounts', () => {
    const recipe = { ...RECIPES[0], ingredients: [{ ingredientId: 'rice', quantity: 50, unit: 'g' as const, optional: true }, { ingredientId: 'rice', quantity: 100, unit: 'g' as const }] }
    const match = matchRecipe(recipe, { rice: 120 })
    expect(match.canMake).toBe(true)
    expect(match.lines[0].have).toBe(0)
    expect(match.lines[1].have).toBe(100)
  })
  it('does not ignore sub-gram shortages', () => {
    const recipe = { ...RECIPES[0], ingredients: [{ ingredientId: 'rice', quantity: 100, unit: 'g' as const }] }
    expect(matchRecipe(recipe, { rice: 99.9 }).canMake).toBe(false)
    expect(matchRecipe(recipe, { rice: 100 - 1e-9 }).canMake).toBe(true)
  })
})

describe('recipe filters and substitution guidance', () => {
  it('filters by query, pantry, quick meals and dietary goals', async () => {
    const { applyFilters } = await import('./recipeMatching')
    const recipes = RECIPES.map(recipe => matchRecipe(recipe, {}))
    expect(applyFilters(recipes, new Set(['only-mine']))).toHaveLength(0)
    expect(applyFilters(recipes, new Set(), 'NOT A FOOD')).toHaveLength(0)
    expect(applyFilters(recipes, new Set(), 'rice').length).toBeGreaterThan(0)
    for (const filter of ['protein', 'veg', 'quick', 'minimal-equipment', 'family', 'lowest-cost'] as const) {
      const result = applyFilters(recipes, new Set([filter]))
      expect(result.every(match => filter !== 'quick' || match.recipe.minutes <= 25)).toBe(true)
      expect(result.every(match => filter !== 'protein' || match.perServing.protein >= 15)).toBe(true)
      expect(result.every(match => filter !== 'veg' || match.vegServings >= 2)).toBe(true)
      expect(result.every(match => filter !== 'family' || match.recipe.servings >= 4)).toBe(true)
    }
  })
  it('suggests only owned substitutes and never assumes water', async () => {
    const { substitutionsFor, minimalEquipment } = await import('./recipeMatching')
    const recipe = RECIPES.find(r => r.id === 'box-bean-rice')!
    const match = matchRecipe(recipe, {})
    expect(substitutionsFor(match, {})).toEqual([])
    expect(substitutionsFor(match, { 'brown-rice': 100 })).toContainEqual(expect.objectContaining({ from: 'rice', to: 'brown-rice' }))
    expect(minimalEquipment({ ...recipe, equipment: ['pot', 'skillet'] })).toBe(false)
    expect(minimalEquipment({ ...recipe, equipment: ['none'] })).toBe(true)
  })
})
