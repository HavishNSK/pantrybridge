import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { daysUntil } from '../../lib/pantry'
import { UNITS, UNIT_LABEL, unitsFor } from '../../lib/units'
import { useStore } from '../../store/useStore'
import type { PantryItem, Unit } from '../../types'
import { IconButton } from '../ui/Button'
import { Input, Select } from '../ui/Field'
import { DaysTag } from './DaysTag'
import { rowDomId } from './dates'

/** Shared column template so the header row and item rows line up on wide screens. */
export const ROW_GRID = 'sm:grid-cols-[minmax(0,1fr)_92px_112px_160px_118px_40px]'

export function PantryRow({ item, highlighted, onRemove }: { item: PantryItem; highlighted: boolean; onRemove: (item: PantryItem, viaKeyboard: boolean) => void }) {
  const updateItem = useStore((s) => s.updateItem)
  const ing = INGREDIENT_BY_ID[item.ingredientId]
  const name = ing?.name ?? item.ingredientId
  const units: Unit[] = ing ? unitsFor(ing) : UNITS
  const days = daysUntil(item.expiresAt)

  // Local draft so the field can be cleared or hold "1." mid-typing; resyncs when the store changes.
  const [draft, setDraft] = useState(String(item.quantity))
  const [seen, setSeen] = useState(item.quantity)
  if (seen !== item.quantity) {
    setSeen(item.quantity)
    setDraft(String(item.quantity))
  }
  const draftNum = Number(draft)
  const qtyInvalid = draft.trim() === '' || !Number.isFinite(draftNum) || draftNum <= 0

  const qtyId = `${item.uid}-qty`
  const errId = `${item.uid}-qty-err`

  return (
    <li
      id={rowDomId(item.uid)}
      className={`-mx-5 grid scroll-mt-28 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3 transition-colors duration-700 ${ROW_GRID} ${highlighted ? 'bg-leaf-wash' : ''}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[16px] font-semibold text-ink" title={name}>{name}</p>
        {days != null && <DaysTag days={days} className="mt-1 sm:hidden" />}
      </div>

      <div className="col-span-2 row-start-2 grid grid-cols-[88px_minmax(0,1fr)_minmax(0,1.4fr)] gap-2 sm:contents">
        <div>
          <Input
            id={qtyId}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            aria-label={`Amount of ${name}`}
            aria-invalid={qtyInvalid || undefined}
            aria-describedby={qtyInvalid ? errId : undefined}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              const n = Number(e.target.value)
              if (e.target.value.trim() !== '' && Number.isFinite(n) && n > 0) updateItem(item.uid, { quantity: Math.round(n * 100) / 100 })
            }}
            onBlur={() => qtyInvalid && setDraft(String(item.quantity))}
            className={`num ${qtyInvalid ? 'ring-2 ring-terracotta-ink' : ''}`}
          />
          {qtyInvalid && <span id={errId} className="sr-only">Enter an amount above zero. The last saved amount is kept.</span>}
        </div>
        <Select aria-label={`Unit for ${name}`} value={item.unit} onChange={(e) => updateItem(item.uid, { unit: e.target.value as Unit })}>
          {!units.includes(item.unit) && <option value={item.unit}>{UNIT_LABEL[item.unit]}</option>}
          {units.map((u) => (
            <option key={u} value={u}>{UNIT_LABEL[u]}</option>
          ))}
        </Select>
        <Input
          type="date"
          aria-label={`Use-by date for ${name} (optional)`}
          value={item.expiresAt ?? ''}
          onChange={(e) => updateItem(item.uid, { expiresAt: e.target.value || undefined })}
          className="num min-w-0"
        />
      </div>

      <div className="hidden sm:block">{days != null ? <DaysTag days={days} /> : <span className="text-sm text-ink-2">No date</span>}</div>

      <IconButton label={`Remove ${name}`} onClick={(e) => onRemove(item, e.detail === 0)} className="col-start-2 row-start-1 justify-self-end hover:!bg-terracotta-wash hover:!text-terracotta-ink sm:col-start-auto sm:row-start-auto">
        <Trash2 size={18} />
      </IconButton>
    </li>
  )
}
