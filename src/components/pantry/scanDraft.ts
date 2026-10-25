import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { makeUid } from '../../data/demoPantry'
import { unitsFor } from '../../lib/units'
import type { PantryItem, Unit } from '../../types'
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from '../../lib/vision'

export const nameInputId = (key: string) => `rev-${key}-name`

/** One editable line in the scan review list. */
export interface DraftRow {
  key: string
  text: string
  ingredientId: string | null
  quantity: string
  unit: Unit
  expiresAt: string
  /** name field has been left at least once, so we may flag it */
  touched: boolean
}

export function rowFromItem(it: PantryItem): DraftRow {
  return {
    key: it.uid,
    text: INGREDIENT_BY_ID[it.ingredientId]?.name ?? it.ingredientId,
    ingredientId: INGREDIENT_BY_ID[it.ingredientId] ? it.ingredientId : null,
    quantity: String(it.quantity),
    unit: it.unit,
    expiresAt: it.expiresAt ?? '',
    touched: true,
  }
}

export const emptyRow = (): DraftRow => ({ key: makeUid(), text: '', ingredientId: null, quantity: '1', unit: 'each', expiresAt: '', touched: false })

export function qtyOk(q: string): boolean {
  const n = Number(q)
  return q.trim() !== '' && Number.isFinite(n) && n > 0
}

export function isValidRow(r: DraftRow): boolean {
  const ing = r.ingredientId ? INGREDIENT_BY_ID[r.ingredientId] : undefined
  return !!ing && qtyOk(r.quantity) && unitsFor(ing).includes(r.unit)
}

export function toPantryItem(r: DraftRow): PantryItem {
  return {
    uid: makeUid(),
    ingredientId: r.ingredientId!,
    quantity: Math.round(Number(r.quantity) * 100) / 100,
    unit: r.unit,
    addedAt: new Date().toISOString(),
    expiresAt: r.expiresAt || undefined,
  }
}

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1)
export const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${mb(bytes)} MB`)

/** Returns a plain-language error, or null when the file can be used. */
export function validatePhoto(file: File): string | null {
  // Some phones report HEIC photos with an empty MIME type, so fall back to the extension.
  const typeOk = ACCEPTED_TYPES.includes(file.type) || (!file.type && /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))
  if (!typeOk) return `"${file.name}" isn't a photo we can use. Please choose a JPG, PNG, WebP or HEIC image.`
  if (file.size > MAX_UPLOAD_BYTES) return `That photo is ${mb(file.size)} MB. Please choose one under ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`
  if (file.size === 0) return 'That file is empty. Please choose another photo.'
  return null
}
