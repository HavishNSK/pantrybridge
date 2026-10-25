import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { CATEGORY_LABEL } from '../../data/ingredients'
import { searchIngredients } from '../../lib/pantry'
import type { Ingredient } from '../../types'
import { inputClass } from '../ui/Field'

interface Props {
  id: string
  value: string
  onChange: (text: string) => void
  onSelect: (ing: Ingredient) => void
  onBlur?: () => void
  invalid?: boolean
  describedBy?: string
  ariaLabel?: string
  placeholder?: string
}

/**
 * Ingredient autocomplete (ARIA 1.2 combobox): focus stays in the input, the highlighted
 * option is exposed via aria-activedescendant, arrows move, Enter picks, Esc closes.
 */
export function IngredientCombobox({ id, value, onChange, onSelect, onBlur, invalid, describedBy, ariaLabel, placeholder = 'Start typing, e.g. beans' }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const options = useMemo(() => searchIngredients(value, 8), [value])
  const listId = `${id}-listbox`
  const optId = (i: number) => `${id}-opt-${i}`
  const show = open && options.length > 0
  const activeIdx = Math.min(active, Math.max(0, options.length - 1))

  useEffect(() => {
    if (show) document.getElementById(`${id}-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, show, id])

  const choose = (ing: Ingredient) => {
    onSelect(ing)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(0)
        } else if (options.length) setActive((activeIdx + 1) % options.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(Math.max(0, options.length - 1))
        } else if (options.length) setActive((activeIdx - 1 + options.length) % options.length)
        break
      case 'Enter':
        if (show) {
          e.preventDefault()
          choose(options[activeIdx])
        }
        break
      case 'Escape':
        if (open) {
          // Keep Esc from also closing a surrounding dialog.
          e.preventDefault()
          e.stopPropagation()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={listId}
        aria-activedescendant={show ? optId(activeIdx) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          onBlur?.()
        }}
        onKeyDown={onKeyDown}
        className={`${inputClass} ${invalid ? 'ring-2 ring-terracotta-ink' : ''}`}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching ingredients"
        hidden={!show}
        className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded-lg bg-paper py-1 ring-1 ring-rule-strong shadow-[0_10px_30px_-12px_rgba(37,44,40,0.45)]"
      >
        {options.map((ing, i) => (
          <li
            key={ing.id}
            id={optId(i)}
            role="option"
            aria-selected={i === activeIdx}
            // Keep focus in the input so blur does not close the list before the click lands.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(ing)}
            onMouseMove={() => i !== activeIdx && setActive(i)}
            className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-[15px] ${i === activeIdx ? 'bg-leaf-wash text-forest' : 'text-ink'}`}
          >
            <span className="font-semibold">{ing.name}</span>
            <span className="text-xs text-ink-2">{CATEGORY_LABEL[ing.category]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
