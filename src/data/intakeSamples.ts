import { emptyRow, rowFromItem, type DraftRow } from '../components/pantry/scanDraft'
import { demoScanResults } from './demoPantry'
import { INGREDIENT_BY_ID } from './ingredients'
import type { Unit } from '../types'

export type IntakeSource = 'pantry' | 'food-box' | 'receipt'
export const INTAKE_SOURCES: { id: IntakeSource; label: string }[] = [
  { id: 'food-box', label: 'Food box' },
  { id: 'receipt', label: 'Grocery receipt' },
  { id: 'pantry', label: 'Pantry photo' },
]

type SampleLine = [id: string, amount: string, unit: Unit, sourceText?: string]
const BOX: SampleLine[] = [
  ['rice', '300', 'g'], ['black-beans', '1', 'can'], ['pasta', '300', 'g'],
  ['diced-tomatoes', '2', 'can'], ['lentils', '240', 'g'], ['carrots', '240', 'g'],
]
const RECEIPT: SampleLine[] = [
  ['rice', '300', 'g', 'RICE 300G'], ['black-beans', '1', 'can', 'BLK BEANS 15OZ'],
  ['pasta', '', 'g', 'PASTA 1 @ 1.29 — package size unknown'],
  ['diced-tomatoes', '2', 'can', 'DCD TOM 14.5OZ x2'],
  ['lentils', '240', 'g', 'LENTILS 240G'], ['carrots', '240', 'g', 'CARROT 240G'],
]

export function intakeSample(source: IntakeSource): { rows: DraftRow[]; excluded: string[] } {
  if (source === 'pantry') return { rows: demoScanResults().map(rowFromItem), excluded: [] }
  const lines = source === 'receipt' ? RECEIPT : BOX
  return {
    rows: lines.map(([ingredientId, quantity, unit, sourceText]) => ({
      ...emptyRow(), ingredientId, text: INGREDIENT_BY_ID[ingredientId].name,
      quantity, unit, demo: true, touched: true, sourceText,
    })),
    excluded: source === 'receipt' ? ['PAPER TOWELS'] : [],
  }
}
