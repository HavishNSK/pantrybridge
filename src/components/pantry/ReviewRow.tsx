import { AlertCircle, Trash2 } from 'lucide-react'
import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { resolveIngredient } from '../../lib/pantry'
import { UNITS, UNIT_LABEL, unitsFor } from '../../lib/units'
import type { Ingredient, Unit } from '../../types'
import { IconButton } from '../ui/Button'
import { Input, Select } from '../ui/Field'
import { IngredientCombobox } from './IngredientCombobox'
import { prefillExpiry } from './dates'
import { nameInputId, qtyOk, type DraftRow } from './scanDraft'

export function ReviewRow({ row, onChange, onRemove }: { row: DraftRow; onChange: (patch: Partial<DraftRow>) => void; onRemove: () => void }) {
  const ing = row.ingredientId ? INGREDIENT_BY_ID[row.ingredientId] : undefined
  const units: Unit[] = ing ? unitsFor(ing) : UNITS
  const label = row.text.trim() || 'new item'
  const nameErr = !row.touched ? null : !row.text.trim() ? 'Name an ingredient, or remove this row.' : !ing ? `We don't recognize "${row.text.trim()}". Pick the closest match from the list.` : null
  const qtyErr = qtyOk(row.quantity) ? null : 'Enter an amount above zero.'
  const errId = `rev-${row.key}-err`

  const pick = (next: Ingredient) => {
    const keepUnit = unitsFor(next).includes(row.unit)
    onChange({
      ingredientId: next.id,
      text: next.name,
      touched: true,
      unit: keepUnit ? row.unit : next.defaultUnit,
      expiresAt: row.expiresAt || prefillExpiry(next.shelfDays),
    })
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3 md:grid-cols-[minmax(0,1fr)_88px_108px_156px_40px] md:items-start">
      <div className="min-w-0">
        <IngredientCombobox
          id={nameInputId(row.key)}
          ariaLabel="Ingredient name"
          value={row.text}
          onChange={(t) => {
            const exact = ing && t === ing.name
            onChange({ text: t, ingredientId: exact ? row.ingredientId : null })
          }}
          onSelect={pick}
          onBlur={() => {
            if (!row.ingredientId && row.text.trim()) {
              const r = resolveIngredient(row.text)
              if (r) return pick(r)
            }
            onChange({ touched: true })
          }}
          invalid={!!nameErr}
          describedBy={nameErr ? errId : undefined}
        />
      </div>

      <IconButton label={`Remove ${label}`} onClick={onRemove} className="col-start-2 row-start-1 hover:!bg-terracotta-wash hover:!text-terracotta-ink md:col-start-5">
        <Trash2 size={18} />
      </IconButton>

      <div className="col-span-2 grid grid-cols-[88px_minmax(0,1fr)_minmax(0,1.4fr)] gap-2 md:col-span-3 md:col-start-2 md:row-start-1 md:grid-cols-[88px_108px_156px]">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          aria-label={`Amount of ${label}`}
          aria-invalid={!!qtyErr || undefined}
          aria-describedby={qtyErr ? errId : undefined}
          value={row.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
          className={`num ${qtyErr ? 'ring-2 ring-terracotta-ink' : ''}`}
        />
        <Select aria-label={`Unit for ${label}`} value={row.unit} onChange={(e) => onChange({ unit: e.target.value as Unit })}>
          {!units.includes(row.unit) && <option value={row.unit}>{UNIT_LABEL[row.unit]}</option>}
          {units.map((u) => (
            <option key={u} value={u}>{UNIT_LABEL[u]}</option>
          ))}
        </Select>
        <Input type="date" aria-label={`Use-by date for ${label} (optional)`} value={row.expiresAt} onChange={(e) => onChange({ expiresAt: e.target.value })} className="num min-w-0" />
      </div>

      {(nameErr || qtyErr) && (
        <p id={errId} role="alert" className="col-span-2 flex items-start gap-1.5 text-sm font-medium text-terracotta-ink md:col-span-5">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {[nameErr, qtyErr].filter(Boolean).join(' ')}
        </p>
      )}
    </li>
  )
}
