import { describe, it, expect } from 'vitest'
import { analyzePlan } from './planner'
import type { PantryItem } from '../types'

describe('plan resource accounting', () => {
  it('charges staples and includes missing free ingredients in shopping', () => {
    const analysis = analyzePlan({ 0: { dinner: { recipeId: 'black-bean-chili', servings: 6 } } }, [])
    expect(analysis.shopping.map(line => line.ingredientId)).toContain('oil')
    expect(analysis.shopping.map(line => line.ingredientId)).toContain('spices')
    expect(analysis.fromPantryCount).toBe(0)
  })
  it('allocates shared grain once across dinners and explicitly provides water', () => {
    const pantry: PantryItem[] = [
      { uid: 'r', ingredientId: 'rice', quantity: 300, unit: 'g', addedAt: '2026-10-25' },
      { uid: 'b', ingredientId: 'black-beans', quantity: 850, unit: 'g', addedAt: '2026-10-25' },
    ]
    const plan = { 0: { dinner: { recipeId: 'box-bean-rice', servings: 4 } }, 1: { dinner: { recipeId: 'box-bean-rice', servings: 4 } } }
    const analysis = analyzePlan(plan, pantry, { safeWater: true })
    expect(analysis.shopping).toHaveLength(1)
    expect(analysis.shopping[0]).toMatchObject({ ingredientId: 'rice', base: 300, forRecipes: ['One-pot beans and rice'] })
    expect(analysis.shopping[0].cost).toBeCloseTo(0.6)
    expect(analysis.remaining.rice).toBe(0)
    expect(analyzePlan(plan, pantry).shopping.map(line => line.ingredientId)).toContain('water')
  })
})
