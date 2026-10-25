import { INGREDIENT_BY_ID } from '../../data/ingredients'
import type { RecipeMatch } from '../../lib/recipeMatching'

export function coverageCounts(m: RecipeMatch) {
  const total = m.lines.filter((l) => !l.item.optional).length
  return { have: total - m.missingRequired.length, total }
}

export function missingNames(m: RecipeMatch): string[] {
  return m.missingRequired.map((l) => INGREDIENT_BY_ID[l.item.ingredientId].name.toLowerCase())
}

export function missingSummary(m: RecipeMatch, max = 3): string {
  const names = missingNames(m)
  if (names.length <= max) return names.join(', ')
  return `${names.slice(0, max).join(', ')} +${names.length - max} more`
}
