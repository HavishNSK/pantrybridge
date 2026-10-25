import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { makeUid } from '../../data/demoPantry'
import { resolveIngredient } from '../../lib/pantry'
import { UNIT_LABEL, unitsFor } from '../../lib/units'
import { useStore } from '../../store/useStore'
import type { Ingredient, Unit } from '../../types'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { toast } from '../ui/Toast'
import { IngredientCombobox } from './IngredientCombobox'
import { prefillExpiry } from './dates'

const FORM_ID = 'add-item-form'

export function AddItemSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded?: (ingredientId: string) => void }) {
  const addItems = useStore((s) => s.addItems)
  const [text, setText] = useState('')
  const [ing, setIng] = useState<Ingredient | null>(null)
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState<Unit>('each')
  const [expiry, setExpiry] = useState('')
  const [errors, setErrors] = useState<{ name?: string; qty?: string }>({})

  const reset = () => {
    setText('')
    setIng(null)
    setQty('1')
    setUnit('each')
    setExpiry('')
    setErrors({})
  }
  const close = () => {
    reset()
    onClose()
  }

  const pick = (next: Ingredient) => {
    setIng(next)
    setText(next.name)
    setUnit(next.defaultUnit)
    setExpiry(prefillExpiry(next.shelfDays))
    setErrors((e) => ({ ...e, name: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const chosen = ing ?? resolveIngredient(text) ?? null
    const n = Number(qty)
    const next: typeof errors = {}
    if (!chosen) next.name = text.trim() ? `We don't have "${text.trim()}" in our ingredient list yet. Pick the closest match.` : 'Choose an ingredient.'
    if (!(qty.trim() !== '' && Number.isFinite(n) && n > 0)) next.qty = 'Enter an amount above zero.'
    setErrors(next)
    if (!chosen || next.qty) return
    const u = unitsFor(chosen).includes(unit) ? unit : chosen.defaultUnit
    addItems([{ uid: makeUid(), ingredientId: chosen.id, quantity: Math.round(n * 100) / 100, unit: u, addedAt: new Date().toISOString(), expiresAt: expiry || undefined }])
    toast(`Added ${chosen.name}`)
    onAdded?.(chosen.id)
    close()
  }

  const units = ing ? unitsFor(ing) : []

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Add an item"
      footer={
        <div className="flex gap-2">
          <Button type="submit" form={FORM_ID} icon={<Plus size={18} />} className="flex-1">Add to pantry</Button>
          <Button variant="secondary" onClick={close}>Cancel</Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="Ingredient" htmlFor="add-ing" hint={errors.name ? undefined : 'Use the arrow keys to move through matches, Enter to pick.'}>
          <IngredientCombobox
            id="add-ing"
            value={text}
            onChange={(t) => {
              setText(t)
              if (ing && t !== ing.name) setIng(null)
            }}
            onSelect={pick}
            onBlur={() => {
              if (!ing && text.trim()) {
                const r = resolveIngredient(text)
                if (r) pick(r)
              }
            }}
            invalid={!!errors.name}
            describedBy={errors.name ? 'add-ing-err' : undefined}
          />
          {errors.name && <p id="add-ing-err" role="alert" className="text-sm font-medium text-terracotta-ink">{errors.name}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" htmlFor="add-qty">
            <Input
              id="add-qty"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              aria-invalid={!!errors.qty || undefined}
              aria-describedby={errors.qty ? 'add-qty-err' : undefined}
              className="num"
            />
          </Field>
          <Field label="Unit" htmlFor="add-unit">
            <Select id="add-unit" value={unit} disabled={!ing} onChange={(e) => setUnit(e.target.value as Unit)}>
              {!ing && <option value={unit}>Pick an item first</option>}
              {units.map((u) => (
                <option key={u} value={u}>{UNIT_LABEL[u]}</option>
              ))}
            </Select>
          </Field>
        </div>
        {errors.qty && <p id="add-qty-err" role="alert" className="-mt-3 text-sm font-medium text-terracotta-ink">{errors.qty}</p>}

        <Field
          label="Use-by date (optional)"
          htmlFor="add-exp"
          hint={ing && expiry ? `Estimated from a typical shelf life of ${ing.shelfDays} days. Change it to the date on the package.` : 'Leave blank for shelf-stable items.'}
        >
          <Input id="add-exp" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="num" />
        </Field>
      </form>
    </Sheet>
  )
}
