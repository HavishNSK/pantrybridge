import { describe, expect, it } from 'vitest'
import { emptyRow, isValidRow, toPantryItem, validatePhoto, dateOk, rowFromItem } from './scanDraft'
import { intakeSample } from '../../data/intakeSamples'
import { mergeItems } from '../../lib/pantry'

describe('intake review', () => {
  it('requires correction of unknown receipt package quantities and excludes nonfood', () => {
    const receipt = intakeSample('receipt')
    expect(receipt.rows.some((row) => row.quantity === '' && !isValidRow(row))).toBe(true)
    expect(receipt.excluded).toContain('PAPER TOWELS')
    expect(receipt.rows.every((row) => row.demo)).toBe(true)
  })
  it('preserves sample provenance through confirmation and mixed merges', () => {
    const row = { ...emptyRow(), ingredientId: 'rice', quantity: '300', unit: 'g' as const, demo: true }
    const sample = toPantryItem(row)
    expect(sample.demo).toBe(true)
    const ordinary = { ...sample, uid: 'ordinary', demo: false }
    expect(mergeItems([ordinary], [sample])[0].demo).toBe(true)
    expect(mergeItems([sample], [ordinary])[0].demo).toBe(true)
    expect(ordinary.quantity).toBe(300)
  })
  it('keeps manual entries ordinary and validates optional dates and file boundaries', () => {
    const ordinary = toPantryItem({ ...emptyRow(), ingredientId: 'rice', quantity: '2', unit: 'g' })
    expect(ordinary.demo).toBeUndefined()
    expect(rowFromItem(ordinary).ingredientId).toBe('rice')
    expect(dateOk('')).toBe(true)
    expect(dateOk('2026-12-31')).toBe(true)
    expect(dateOk('not a date')).toBe(false)
    expect(validatePhoto({ name: 'x.jpg', type: 'image/jpeg', size: 1 } as File)).toBeNull()
    expect(validatePhoto({ name: 'x.heic', type: '', size: 1 } as File)).toBeNull()
    expect(validatePhoto({ name: 'x.txt', type: 'text/plain', size: 1 } as File)).toContain("isn't a photo")
    expect(validatePhoto({ name: 'x.jpg', type: 'image/jpeg', size: 0 } as File)).toContain('empty')
    expect(validatePhoto({ name: 'x.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 } as File)).toContain('under 10 MB')
    expect(intakeSample('food-box').rows.every(isValidRow)).toBe(true)
    expect(intakeSample('pantry').rows.every(isValidRow)).toBe(true)
  })
  it('rejects excessive quantities before conversion can overflow', () => {
    const row = { ...emptyRow(), ingredientId: 'rice', quantity: '1e308', unit: 'g' as const }
    expect(isValidRow(row)).toBe(false)
    expect(() => toPantryItem(row)).toThrow('Correct the ingredient, quantity, unit, or date before saving.')
    expect(isValidRow({ ...row, quantity: '1000001' })).toBe(false)
    expect(toPantryItem({ ...row, quantity: '1000000' }).quantity).toBe(1000000)
  })
  it('rejects impossible dates and quantities rounded down to zero', () => {
    const row = { ...emptyRow(), ingredientId: 'rice', quantity: '0.001', unit: 'g' as const }
    expect(isValidRow(row)).toBe(false)
    expect(isValidRow({ ...row, quantity: '1', expiresAt: '2026-02-30' })).toBe(false)
  })
})
