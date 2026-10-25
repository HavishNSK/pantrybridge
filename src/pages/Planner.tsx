import { Eraser, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BudgetPanel } from '../components/planner/BudgetPanel'
import { ConfirmSheet } from '../components/planner/ConfirmSheet'
import { MealPicker, type PickTarget } from '../components/planner/MealPicker'
import { PantryLeft } from '../components/planner/PantryLeft'
import { ShoppingList } from '../components/planner/ShoppingList'
import { ThreeDinners } from '../components/planner/ThreeDinners'
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
  const extrasCount = useStore((s) => s.extras.length)
  const household = useStore((s) => s.household)
  const setHousehold = useStore((s) => s.setHousehold)
  const clearPlan = useStore((s) => s.clearPlan)

  const safeWater = useStore((s) => s.cookingPreferences.safeWater)
  const analysis = useMemo(() => analyzePlan(plan, pantry, { safeWater }), [plan, pantry, safeWater])
  const count = plannedCount(plan)
  const [pick, setPick] = useState<PickTarget | null>(null)
  const [confirm, setConfirm] = useState(false)

  const doClear = () => {
    clearPlan()
    toast('Week cleared', 'info')
  }

  return (
    <>
      <PageHeader
        title="Meal plan"
        lede={
          count === 0 ? (
            'Find dinners from your pantry, then save them to your week.'
          ) : (
            <>
              <span className="num">{count}</span> meals planned · <span className="num">{analysis.fromPantryCount}</span> covered by your pantry.
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
            <Button variant="secondary" icon={<Eraser size={17} />} disabled={count === 0} onClick={() => setConfirm(true)}>Clear week</Button>
          </>
        }
      />

      <ThreeDinners />

      <details className="mb-6 rounded-lg border border-rule bg-paper p-4">
        <summary className="cursor-pointer py-2 font-semibold text-forest">Weekly calendar{count > 0 ? ` · ${count} meals` : ' (optional)'}</summary>
        <div className="mt-4"><WeekGrid analysis={analysis} onPick={(day, slot) => setPick({ day, slot })} /></div>
      </details>

      {(count > 0 || extrasCount > 0) && <div className="mt-6 modules lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ShoppingList analysis={analysis} />
        {count > 0 && <div className="module space-y-4">
          <details><summary className="min-h-11 cursor-pointer py-2 font-semibold text-forest">Weekly budget (optional)</summary><BudgetPanel analysis={analysis} /></details>
          <details><summary className="min-h-11 cursor-pointer py-2 font-semibold text-forest">What’s left in my pantry?</summary><PantryLeft analysis={analysis} /></details>
        </div>}
      </div>}

      {count === 0 && extrasCount === 0 && <details className="mb-6 rounded-lg border border-rule bg-paper p-4">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-forest">Shopping list (optional)</summary>
        <ShoppingList analysis={analysis} />
      </details>}

      <MealPicker target={pick} onClose={() => setPick(null)} />
      <ConfirmSheet open={confirm} title="Clear this week?" confirmLabel="Clear week" onConfirm={doClear} onClose={() => setConfirm(false)}>
        This removes all <span className="num font-semibold text-ink">{count}</span> planned meals. Your pantry and any items you added to the list stay as they are.
      </ConfirmSheet>
    </>
  )
}
