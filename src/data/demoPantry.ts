import type { PantryItem, Unit } from '../types'

type Seed = [ingredientId: string, quantity: number, unit: Unit, expiresInDays?: number]

/** Sample household pantry, flagged `demo` so the UI can label it. */
const PANTRY_SEED: Seed[] = [
  ['rice', 2, 'lb'],
  ['oats', 18, 'oz'],
  ['pasta', 1, 'lb'],
  ['black-beans', 3, 'can'],
  ['pinto-beans', 2, 'can'],
  ['chickpeas', 1, 'can'],
  ['lentils', 1, 'lb'],
  ['diced-tomatoes', 3, 'can'],
  ['corn', 2, 'can'],
  ['tuna', 2, 'can'],
  ['peanut-butter', 16, 'oz'],
  ['eggs', 10, 'each', 12],
  ['milk', 6, 'cup', 3],
  ['cheddar', 6, 'oz', 18],
  ['tortillas', 8, 'each', 9],
  ['onion', 3, 'each', 30],
  ['garlic', 1, 'each', 40],
  ['carrots', 5, 'each', 6],
  ['sweet-potatoes', 3, 'each', 14],
  ['spinach', 5, 'oz', 2],
  ['bananas', 3, 'each', 2],
  ['apples', 2, 'each', 20],
  ['mixed-veg', 12, 'oz'],
  ['broth', 4, 'cup'],
  ['oil', 16, 'tbsp'],
  ['spices', 40, 'tsp'],
]

/** Sample results returned by demo-mode scanning (no image model is connected). */
const SCAN_SEED: Seed[] = [
  ['black-beans', 2, 'can'],
  ['diced-tomatoes', 1, 'can'],
  ['pasta', 1, 'lb'],
  ['peanut-butter', 16, 'oz'],
  ['oats', 18, 'oz'],
  ['onion', 2, 'each', 30],
  ['bananas', 4, 'each', 4],
  ['peas', 12, 'oz'],
]

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

let counter = 0
export function makeUid(): string {
  counter += 1
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`
}

function build(seed: Seed[], demo: boolean): PantryItem[] {
  const now = new Date().toISOString()
  return seed.map(([ingredientId, quantity, unit, exp]) => ({
    uid: makeUid(),
    ingredientId,
    quantity,
    unit,
    addedAt: now,
    expiresAt: exp != null ? daysFromNow(exp) : undefined,
    demo,
  }))
}

export const demoPantry = () => build(PANTRY_SEED, true)
export const demoScanResults = () => build(SCAN_SEED, true)
