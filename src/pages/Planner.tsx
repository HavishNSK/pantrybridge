import { Eraser, Sparkles, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BudgetPanel } from '../components/planner/BudgetPanel'
import { ConfirmSheet } from '../components/planner/ConfirmSheet'
import { MealPicker, type PickTarget } from '../components/planner/MealPicker'
import { PantryLeft } from '../components/planner/PantryLeft'
import { ShoppingList } from '../components/planner/ShoppingList'
import { WeekGrid } from '../components/planner/WeekGrid'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/Section'
import { Stepper } from '../components/ui/Stepper'
import { DemoTag, EstimateTag, Tag } from '../components/ui/Tag'
import { toast } from '../components/ui/Toast'
import { shortDate, weekOf } from '../lib/format'
import { analyzePlan, plannedCount } from '../lib/planner'
import { isDemoPantry, useStore } from '../store/useStore'

export default function Planner() {
  const plan = useStore((s) => s.plan)
  const pantry = useStore((s) => s.pantry)
  const household = useStore((s) => s.household)
  const setHousehold = useStore((s) => s.setHousehold)
  const suggest = useStore((s) => s.suggest)
  const clearPlan = useStore((s) => s.clearPlan)

  const analysis = useMemo(() => analyzePlan(plan, pantry), [plan, pantry])
  const count = plannedCount(plan)
  const [pick, setPick] = useState<PickTarget | null>(null)
  const [confirm, setConfirm] = useState<'suggest' | 'clear' | null>(null)

  const doSuggest = () => {
    suggest()
    toast('Built a week from your pantry')
  }
  const doClear = () => {
    clearPlan()
    toast('Week cleared', 'info')
  }

  return (
    <>
      <PageHeader
        title="Your week"
        lede={
          count === 0 ? (
            'Nothing planned yet. Let us suggest a week from your pantry, or add meals one at a time.'
          ) : (
            <>
              <span className="num">{count}</span> of 21 meals planned, <span className="num">{analysis.fromPantryCount}</span> made entirely from what you have.
            </>
          )
        }
        meta={
          <>
            <Tag tone="neutral">Week of {shortDate(weekOf())}</Tag>
            {isDemoPantry(pantry) && <DemoTag>Demo pantry</DemoTag>}
            <EstimateTag>Costs are estimates</EstimateTag>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-lg bg-paper py-0.5 pl-3 pr-0.5 ring-1 ring-inset ring-rule">
              <Users size={16} className="text-ink-2" aria-hidden="true" />
              <span className="text-sm font-semibold text-ink">People</span>
              <Stepper value={household} onChange={setHousehold} label="household size" />
            </div>
            <Button icon={<Sparkles size={17} />} onClick={() => (count > 0 ? setConfirm('suggest') : doSuggest())}>Suggest my week</Button>
            <Button variant="secondary" icon={<Eraser size={17} />} disabled={count === 0} onClick={() => setConfirm('clear')}>Clear week</Button>
          </>
        }
      />

      <WeekGrid analysis={analysis} onPick={(day, slot) => setPick({ day, slot })} />

      <div className="mt-6 modules lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ShoppingList analysis={analysis} />
        <div className="grid content-start gap-px bg-rule">
          <BudgetPanel analysis={analysis} />
          <PantryLeft analysis={analysis} />
        </div>
      </div>

      <MealPicker target={pick} onClose={() => setPick(null)} />
      <ConfirmSheet
        open={confirm === 'suggest'}
        title="Replace this week?"
        confirmLabel="Suggest a new week"
        onConfirm={doSuggest}
        onClose={() => setConfirm(null)}
      >
        You have <span className="num font-semibold text-ink">{count}</span> meals planned. A new suggestion replaces them with meals built from your pantry for <span className="num">{household}</span> {household === 1 ? 'person' : 'people'}, and resets the checked-off shopping items.
      </ConfirmSheet>
      <ConfirmSheet open={confirm === 'clear'} title="Clear this week?" confirmLabel="Clear week" onConfirm={doClear} onClose={() => setConfirm(null)}>
        This removes all <span className="num font-semibold text-ink">{count}</span> planned meals. Your pantry and any items you added to the list stay as they are.
      </ConfirmSheet>
    </>
  )
}
