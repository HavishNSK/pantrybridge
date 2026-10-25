import { expect, it } from 'vitest'
import { RECIPES } from '../../data/recipes'
import { matchRecipe } from '../../lib/recipeMatching'
import { coverageCounts } from './matchText'

it('includes missing required staples in coverage without negative counts', () => {
  const recipe = RECIPES.find((r) => r.ingredients.some((i) => i.ingredientId === 'oil' && !i.optional))!
  const match = matchRecipe(recipe, {})
  const counts = coverageCounts(match)
  expect(counts.have).toBe(0)
  expect(counts.total).toBe(match.lines.filter((l) => !l.item.optional).length)
})
