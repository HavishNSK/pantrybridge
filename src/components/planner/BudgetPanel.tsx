import { ArrowRight, Lock } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RECIPE_BY_ID } from '../../data/recipes'
import { money } from '../../lib/format'
import { budgetPace, cheaperSwaps, DAYS, suggestWeek, type PlanAnalysis } from '../../lib/planner'
import { useStore } from '../../store/useStore'
import type { Budget } from '../../types'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Field'
import { RollingNumber } from '../ui/RollingNumber'
import { ModuleTitle } from '../ui/Section'
import { EstimateTag } from '../ui/Tag'
import { toast } from '../ui/Toast'
import { localIso } from './helpers'

const SOURCE_LABEL: Record<Budget['source'], string> = {
  groceries: 'Grocery money',
  benefits: 'Benefits (like SNAP)',
  mixed: 'Both',
}

export function BudgetPanel({ analysis }: { analysis: PlanAnalysis }) {
  const budget = useStore((s) => s.budget)
  const plan = useStore((s) => s.plan)
  const pantry = useStore((s) => s.pantry)
  const household = useStore((s) => s.household)
  const setBudget = useStore((s) => s.setBudget)
  const setMeal = useStore((s) => s.setMeal)
  const replacePlan = useStore((s) => s.replacePlan)
  const [editing, setEditing] = useState(!budget)
  const [formKey, setFormKey] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash !== '#budget' || !ref.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [hash])

  const pace = budgetPace(budget)
  const showForm = editing || !pace
  const cost = analysis.additionalCost
  const over = pace ? cost > pace.perWeek + 0.005 : false
  const swaps = over ? cheaperSwaps(plan, pantry) : []

  const useMore = () => {
    const next = suggestWeek(pantry, household, { maxAddedPerMeal: 0.5 })
    const meals = Object.values(next).reduce((n, d) => n + Object.keys(d).length, 0)
    if (!meals) {
      toast('Not enough in the pantry for a full week yet. Your plan is unchanged.', 'info')
      return
    }
    replacePlan(next)
    toast('Rebuilt the week around what you already have')
  }

  return (
    <div id="budget" ref={ref} className="module flex scroll-mt-24 flex-col gap-4">
      <ModuleTitle right={!showForm ? <button type="button" onClick={() => setEditing(true)} className="min-h-10 px-1 text-sm font-semibold text-forest underline">Edit</button> : undefined}>
        Budget
      </ModuleTitle>

      {showForm ? (
        <BudgetForm
          key={formKey}
          budget={budget}
          onSave={(b) => { setBudget(b); setEditing(false); toast('Budget saved on this device') }}
          onCancel={budget ? () => setEditing(false) : undefined}
          onClear={budget ? () => { setBudget(null); setEditing(false); setFormKey((k) => k + 1); toast('Budget removed', 'info') } : undefined}
        />
      ) : pace && budget ? (
        <>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm text-ink-2">This week's added cost</p>
              <p className="text-sm text-ink-2">Weekly allowance</p>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <RollingNumber value={money(cost)} className={`display text-4xl ${over ? 'text-terracotta-ink' : 'text-forest'}`} label={`Added cost ${money(cost)}`} />
              <RollingNumber value={money(pace.perWeek)} className="display text-2xl text-ink" label={`Weekly allowance ${money(pace.perWeek)}`} />
            </div>
            <CapacityStrip used={cost} capacity={pace.perWeek} />
            <p className="mt-2 text-sm text-ink-2">
              {over ? (
                <>About <span className="num font-semibold text-ink">{money(cost - pace.perWeek)}</span> more than this week's share.</>
              ) : (
                <><span className="num font-semibold text-ink">{money(pace.perWeek - cost)}</span> of this week's share left.</>
              )}{' '}
              {money(budget.amount)} {SOURCE_LABEL[budget.source].toLowerCase()} over <span className="num">{pace.days}</span> days.
            </p>
          </div>

          {over && (
            <div className="flex flex-col gap-3 border-t border-rule pt-4">
              <h3 className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em] text-forest">Ways to bring it closer</h3>
              {swaps.length > 0 && (
                <ul className="divide-y divide-rule">
                  {swaps.map((s) => (
                    <li key={`${s.day}-${s.slot}`} className="flex items-center gap-3 py-2">
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="block text-ink-2">{DAYS[s.day]} {s.slot}</span>
                        <span className="block text-ink">
                          {RECIPE_BY_ID[s.from].name} <ArrowRight size={13} className="inline text-ink-2" aria-label="to" /> <span className="font-semibold">{RECIPE_BY_ID[s.to].name}</span>
                        </span>
                        <span className="num block text-leaf-ink">saves about {money(s.saves)}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const servings = plan[s.day]?.[s.slot]?.servings ?? household
                          setMeal(s.day, s.slot, { recipeId: s.to, servings })
                          toast(`Swapped in ${RECIPE_BY_ID[s.to].name}`)
                        }}
                      >
                        Swap
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="secondary" onClick={useMore}>Use more of what you have</Button>
              <p className="text-sm text-ink-2">
                Some weeks need more than one plan. <Link to="/support" className="font-semibold text-forest underline">Food banks and programs near you can help.</Link>
              </p>
            </div>
          )}
        </>
      ) : null}

      <div className="flex flex-col gap-1.5 border-t border-rule pt-3 text-xs text-ink-2">
        <p className="flex items-start gap-1.5"><Lock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />We never ask for EBT card numbers, PINs, or balances. What you enter stays on this device.</p>
        <p className="flex flex-wrap items-center gap-1.5">
          <EstimateTag>Guidance</EstimateTag> General budgeting guidance, not official benefits information.{' '}
          <Link to="/support" className="font-semibold text-forest underline">Official SNAP info</Link>
        </p>
      </div>
    </div>
  )
}

/** The signature: a fixed-capacity strip (the allowance) that fills as meals add cost. */
function CapacityStrip({ used, capacity }: { used: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(1, used / capacity) : 1
  const over = used > capacity + 0.005
  const ticks = 7
  return (
    <div className="mt-3">
      <div
        role="meter"
        aria-label="Weekly allowance used"
        aria-valuemin={0}
        aria-valuemax={Math.round(capacity * 100) / 100}
        aria-valuenow={Math.round(Math.min(used, capacity) * 100) / 100}
        aria-valuetext={`${money(used)} of ${money(capacity)}`}
        className="relative h-7 overflow-hidden rounded-md bg-cream ring-1 ring-inset ring-rule-strong"
      >
        <div
          className={`h-full origin-left motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[var(--ease-out-expo)] ${over ? 'bg-terracotta' : 'bg-leaf'}`}
          style={{ transform: `scaleX(${pct})` }}
        />
        <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
          {Array.from({ length: ticks }, (_, i) => (
            <span key={i} className={`flex-1 ${i < ticks - 1 ? 'border-r border-ink/15' : ''}`} />
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-2" aria-hidden="true">
        <span>$0</span><span className="num">{money(capacity)} this week</span>
      </div>
    </div>
  )
}

function BudgetForm({ budget, onSave, onCancel, onClear }: { budget: Budget | null; onSave: (b: Budget) => void; onCancel?: () => void; onClear?: () => void }) {
  const [amount, setAmount] = useState(budget ? String(budget.amount) : '')
  const [start, setStart] = useState(() => budget?.start ?? localIso(new Date()))
  const [end, setEnd] = useState(() => budget?.end ?? localIso(daysFromNow(29)))
  const [source, setSource] = useState<Budget['source']>(budget?.source ?? 'groceries')
  const [error, setError] = useState<{ field: 'amount' | 'dates'; text: string } | null>(null)
  const parsed = Number(amount.replace(/[$,\s]/g, ''))
  const amountBad = amount.trim() === '' || !Number.isFinite(parsed) || parsed <= 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n = parsed
    if (amountBad) return setError({ field: 'amount', text: 'Enter an amount above $0.' })
    if (!start || !end || end < start) return setError({ field: 'dates', text: 'The end date needs to be on or after the start date.' })
    setError(null)
    onSave({ amount: Math.round(n * 100) / 100, start, end, source })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <p className="text-[15px] text-ink-2">Optional. Enter what you plan to spend on food for a stretch of time, and we'll show this week's share.</p>
      <Field label="Amount for the period" htmlFor="budget-amount">
        <Input id="budget-amount" inputMode="decimal" placeholder="$0.00" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={error?.field === 'amount' && amountBad} aria-describedby={error?.field === 'amount' ? 'budget-error' : undefined} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" htmlFor="budget-start"><Input id="budget-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="To" htmlFor="budget-end"><Input id="budget-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} aria-invalid={error?.field === 'dates'} aria-describedby={error?.field === 'dates' ? 'budget-error' : undefined} /></Field>
      </div>
      <Field label="This money is" htmlFor="budget-source">
        <Select id="budget-source" value={source} onChange={(e) => setSource(e.target.value as Budget['source'])}>
          <option value="groceries">{SOURCE_LABEL.groceries}</option>
          <option value="benefits">{SOURCE_LABEL.benefits}</option>
          <option value="mixed">{SOURCE_LABEL.mixed}</option>
        </Select>
      </Field>
      {error && <p id="budget-error" role="alert" className="text-sm font-semibold text-terracotta-ink">{error.text}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save budget</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        {onClear && <Button variant="danger" onClick={onClear} className="ml-auto">Remove</Button>}
      </div>
    </form>
  )
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}
