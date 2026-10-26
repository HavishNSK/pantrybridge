import { Check, Copy, Printer, ShoppingBasket, Trash2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { money, shortDate, weekOf } from '../../lib/format'
import type { PlanAnalysis, ShoppingLine } from '../../lib/planner'
import { useStore } from '../../store/useStore'
import type { ListItem } from '../../types'
import { Button, IconButton } from '../ui/Button'
import { inputClass } from '../ui/Field'
import { RollingNumber } from '../ui/RollingNumber'
import { EmptyState, ModuleTitle } from '../ui/Section'
import { EstimateTag } from '../ui/Tag'
import { toast } from '../ui/Toast'
import { amountText, copyText } from './helpers'

const PRINT_CSS = `
#pb-print { display: none; }
@media print {
  body > *:not(#pb-print) { display: none !important; }
  #pb-print { display: block !important; color: #000; background: #fff; font: 12pt/1.45 system-ui, sans-serif; padding: 0; }
  #pb-print h1 { font-size: 20pt; margin: 0 0 4pt; }
  #pb-print h2 { font-size: 13pt; margin: 14pt 0 4pt; border-bottom: 1px solid #000; }
  #pb-print ul { list-style: none; padding: 0; margin: 0; }
  #pb-print li { padding: 3pt 0; border-bottom: 1px dotted #999; display: flex; gap: 8pt; }
  #pb-print .box { width: 10pt; height: 10pt; border: 1px solid #000; flex: none; margin-top: 3pt; }
  #pb-print .done { text-decoration: line-through; color: #666; }
  #pb-print .cost { margin-left: auto; white-space: nowrap; }
  #pb-print small { color: #444; }
}`

function buildText(lines: ShoppingLine[], extras: ListItem[], checked: string[], total: number): string {
  const week = shortDate(weekOf())
  const box = (done: boolean) => (done ? '[x]' : '[ ]')
  const out: string[] = [`FullPlate shopping list (week of ${week})`, '', 'Food']
  for (const l of lines) {
    const ing = INGREDIENT_BY_ID[l.ingredientId]
    out.push(`${box(checked.includes(l.ingredientId))} ${ing.name}: ${amountText(l.ingredientId, l.base)}, est. ${money(l.cost)} (for ${l.forRecipes.join(', ')})`)
  }
  for (const e of extras.filter((x) => x.food)) out.push(`${box(e.done)} ${e.name}`)
  if (!lines.length && !extras.some((x) => x.food)) out.push('Nothing to buy. Every planned meal comes from your pantry.')
  const household = extras.filter((x) => !x.food)
  if (household.length) {
    out.push('', 'Household items (not covered by SNAP)')
    for (const e of household) out.push(`${box(e.done)} ${e.name}`)
  }
  out.push('', `Estimated total for planned meals: ${money(total)} (estimate; store prices vary)`)
  return out.join('\n')
}

export function ShoppingList({ analysis }: { analysis: PlanAnalysis }) {
  const checked = useStore((s) => s.checked)
  const extras = useStore((s) => s.extras)
  const toggleChecked = useStore((s) => s.toggleChecked)
  const addExtra = useStore((s) => s.addExtra)
  const toggleExtra = useStore((s) => s.toggleExtra)
  const removeExtra = useStore((s) => s.removeExtra)
  const [name, setName] = useState('')
  const [food, setFood] = useState(true)

  const lines = analysis.shopping
  const total = analysis.additionalCost
  const left = lines.filter((l) => !checked.includes(l.ingredientId)).reduce((s, l) => s + l.cost, 0)
  const foodExtras = extras.filter((e) => e.food)
  const householdExtras = extras.filter((e) => !e.food)

  const add = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    addExtra(n, food)
    setName('')
    toast(`${n} added to ${food ? 'food' : 'household items'}`)
  }

  const copy = async () => {
    const ok = await copyText(buildText(lines, extras, checked, total))
    toast(ok ? 'Shopping list copied' : 'Could not copy. Try Print instead.', ok ? 'success' : 'info')
  }

  const empty = lines.length === 0 && extras.length === 0

  return (
    <div className="module flex flex-col gap-4">
      <ModuleTitle right={<EstimateTag>Est. prices</EstimateTag>}>Shopping list</ModuleTitle>

      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-4">
        <div>
          <RollingNumber value={money(total)} className="display text-5xl text-forest" label={`Estimated total ${money(total)}`} />
          <p className="mt-1 text-sm text-ink-2">
            est. for this week's meals{lines.length > 0 && checked.length > 0 && <> · <span className="num">{money(left)}</span> still to get</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={<Copy size={15} />} onClick={copy}>Copy list</Button>
          <Button variant="secondary" size="sm" icon={<Printer size={15} />} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {empty ? (
        <EmptyState icon={<ShoppingBasket size={32} />} title="Nothing to buy">
          Every planned meal comes from what you already have. Add anything else you need below.
        </EmptyState>
      ) : (
        <>
          <Group title="Food" note={<>SNAP generally covers food to prepare at home. <a href="https://www.fns.usda.gov/snap/eligible-food-items" target="_blank" rel="noreferrer" className="font-semibold text-forest underline">Check official rules for specific items.</a></>}>
            {lines.map((l) => {
              const ing = INGREDIENT_BY_ID[l.ingredientId]
              const done = checked.includes(l.ingredientId)
              return (
                <Line key={l.ingredientId} done={done} onToggle={() => toggleChecked(l.ingredientId)} label={ing.name}>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`font-semibold ${done ? 'text-ink-2 line-through' : 'text-ink'}`}>{ing.name}</span>
                      <span className="num shrink-0 text-sm font-semibold text-ink">{money(l.cost)}</span>
                    </span>
                    <span className="text-sm text-ink-2">
                      <span className="num">{amountText(l.ingredientId, l.base)}</span> · for {l.forRecipes.join(', ')}
                    </span>
                  </span>
                </Line>
              )
            })}
            {foodExtras.map((e) => (
              <ExtraLine key={e.id} item={e} onToggle={() => toggleExtra(e.id)} onRemove={() => removeExtra(e.id)} />
            ))}
            {lines.length === 0 && foodExtras.length === 0 && <li className="py-3 text-sm text-ink-2">No food to buy. Every planned meal comes from your pantry.</li>}
          </Group>
          {householdExtras.length > 0 && (
            <Group title="Household items (not covered by SNAP)">
              {householdExtras.map((e) => (
                <ExtraLine key={e.id} item={e} onToggle={() => toggleExtra(e.id)} onRemove={() => removeExtra(e.id)} />
              ))}
            </Group>
          )}
        </>
      )}

      <form onSubmit={add} className="flex flex-col gap-2 border-t border-rule pt-4">
        <label htmlFor="extra-name" className="text-sm font-semibold text-ink">Add something else</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="extra-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. milk, dish soap…" className={`${inputClass} sm:flex-1`} maxLength={60} />
          <select aria-label="Item type" value={food ? 'food' : 'household'} onChange={(e) => setFood(e.target.value === 'food')} className={`${inputClass} sm:w-44`}>
            <option value="food">Food</option>
            <option value="household">Household item</option>
          </select>
          <Button type="submit" disabled={!name.trim()}>Add</Button>
        </div>
        <p className="text-xs text-ink-2">SNAP generally covers food to prepare at home, not supplies like soap or paper goods.</p>
      </form>

      {createPortal(
        <div id="pb-print" aria-hidden="true">
          <style>{PRINT_CSS}</style>
          <PrintView lines={lines} foodExtras={foodExtras} householdExtras={householdExtras} checked={checked} total={total} />
        </div>,
        document.body,
      )}
    </div>
  )
}

function Group({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div>
      <h3 className="condensed mb-1 text-[13px] font-extrabold uppercase tracking-[0.04em] text-ink-2">{title}</h3>
      <ul className="divide-y divide-rule">{children}</ul>
      {note && <p className="mt-2 text-xs text-ink-2">{note}</p>}
    </div>
  )
}

function Line({ done, onToggle, label, children, after }: { done: boolean; onToggle: () => void; label: string; children: ReactNode; after?: ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Got ${label}`}
        onClick={onToggle}
        className={`-m-2 grid size-10 shrink-0 place-items-center rounded-lg`}
      >
        <span className={`grid size-6 place-items-center rounded-md ring-1 ring-inset transition-colors ${done ? 'bg-forest text-cream ring-forest' : 'bg-paper ring-rule-strong'}`}>
          {done && <Check size={15} strokeWidth={3} />}
        </span>
      </button>
      {children}
      {after}
    </li>
  )
}

function ExtraLine({ item, onToggle, onRemove }: { item: ListItem; onToggle: () => void; onRemove: () => void }) {
  return (
    <Line done={item.done} onToggle={onToggle} label={item.name} after={<IconButton label={`Remove ${item.name}`} onClick={onRemove} className="-my-2"><Trash2 size={16} /></IconButton>}>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`font-semibold ${item.done ? 'text-ink-2 line-through' : 'text-ink'}`}>{item.name}</span>
        <span className="text-sm text-ink-2">Added by you</span>
      </span>
    </Line>
  )
}

function PrintView({ lines, foodExtras, householdExtras, checked, total }: { lines: ShoppingLine[]; foodExtras: ListItem[]; householdExtras: ListItem[]; checked: string[]; total: number }) {
  return (
    <div>
      <h1>FullPlate shopping list</h1>
      <small>Week of {shortDate(weekOf())} · prices are estimates and vary by store</small>
      <h2>Food</h2>
      <ul>
        {lines.map((l) => (
          <li key={l.ingredientId} className={checked.includes(l.ingredientId) ? 'done' : ''}>
            <span className="box" />
            <span>
              {INGREDIENT_BY_ID[l.ingredientId].name}: {amountText(l.ingredientId, l.base)}
              <br />
              <small>for {l.forRecipes.join(', ')}</small>
            </span>
            <span className="cost">est. {money(l.cost)}</span>
          </li>
        ))}
        {foodExtras.map((e) => (
          <li key={e.id} className={e.done ? 'done' : ''}><span className="box" /><span>{e.name}</span></li>
        ))}
        {!lines.length && !foodExtras.length && <li>Nothing to buy. Every planned meal comes from your pantry.</li>}
      </ul>
      {householdExtras.length > 0 && (
        <>
          <h2>Household items (not covered by SNAP)</h2>
          <ul>
            {householdExtras.map((e) => (
              <li key={e.id} className={e.done ? 'done' : ''}><span className="box" /><span>{e.name}</span></li>
            ))}
          </ul>
        </>
      )}
      <p><strong>Estimated total: {money(total)}</strong></p>
    </div>
  )
}
