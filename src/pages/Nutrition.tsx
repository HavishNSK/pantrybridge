import { CalendarPlus, ChevronDown, Leaf } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DailyProteinBars } from '../components/nutrition/DailyProteinBars'
import { ReferenceMeter } from '../components/nutrition/ReferenceMeter'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState, ModuleTitle, PageHeader } from '../components/ui/Section'
import { DemoTag, EstimateTag, Tag } from '../components/ui/Tag'
import { RollingNumber } from '../components/ui/RollingNumber'
import { INGREDIENT_BY_ID } from '../data/ingredients'
import { money } from '../lib/format'
import { eatenMeals, summarize } from '../lib/nutrition'
import { stockMap } from '../lib/pantry'
import { analyzePlan, type PlanAnalysis } from '../lib/planner'
import { displayAmount, formatQty } from '../lib/units'
import { isDemoPantry, useStore } from '../store/useStore'

const PROTEIN_DV = 50
const FIBER_DV = 28

/** Per-person protein for each day, counting each serving once (leftovers on the day they're eaten). */
function proteinByDay(analysis: PlanAnalysis, household: number): (number | null)[] {
  const out: (number | null)[] = Array(7).fill(null)
  for (const e of eatenMeals(analysis)) {
    out[e.day] = (out[e.day] ?? 0) + (e.match.perServing.protein * e.servings) / Math.max(1, household)
  }
  return out
}

const nameOf = (id: string) => INGREDIENT_BY_ID[id]?.name ?? id

export default function Nutrition() {
  const pantry = useStore((s) => s.pantry)
  const plan = useStore((s) => s.plan)
  const household = useStore((s) => s.household)

  const analysis = useMemo(() => analyzePlan(plan, pantry), [plan, pantry])
  const summary = useMemo(() => summarize(analysis, pantry, household), [analysis, pantry, household])
  const byDay = useMemo(() => proteinByDay(analysis, household), [analysis, household])

  // Produce the household has on hand or in the plan, marked by whether the plan uses it.
  const produce = useMemo(() => {
    const inPlan = new Set(summary.produceVariety)
    const ids = new Set([...summary.produceVariety, ...Object.keys(stockMap(pantry)).filter((id) => INGREDIENT_BY_ID[id]?.vegetable || INGREDIENT_BY_ID[id]?.fruit)])
    return [...ids].map((id) => ({ id, name: nameOf(id), inPlan: inPlan.has(id) })).sort((a, b) => Number(b.inPlan) - Number(a.inPlan) || a.name.localeCompare(b.name))
  }, [summary.produceVariety, pantry])

  const rescuedGrams = analysis.rescued.filter((r) => INGREDIENT_BY_ID[r.ingredientId]?.base !== 'each').reduce((s, r) => s + r.base, 0)
  const rescuedValue = analysis.rescued.reduce((s, r) => s + r.value, 0)
  const demo = isDemoPantry(pantry)
  const utilPct = Math.round(summary.utilization * 100)

  const header = (
    <PageHeader
      title="Nutrition this week"
      lede="Rough estimates for the meals in your plan, per person. They are meant to help you plan, not to judge how anyone eats."
      meta={
        <>
          <EstimateTag>All figures are estimates</EstimateTag>
          {demo && <DemoTag>Demo pantry</DemoTag>}
          {summary.daysPlanned > 0 && (
            <Tag>
              <span className="num">{summary.daysPlanned}</span>&nbsp;day{summary.daysPlanned === 1 ? '' : 's'} planned · household of <span className="num">&nbsp;{household}</span>
            </Tag>
          )}
        </>
      }
    />
  )

  if (summary.mealsTotal === 0) {
    return (
      <div>
        {header}
        <div className="modules">
          <div className="module">
            <EmptyState
              icon={<CalendarPlus size={32} />}
              title="Nothing planned yet"
              action={<ButtonLink to="/planner" icon={<CalendarPlus size={18} />}>Plan your week</ButtonLink>}
            >
              Add a few meals in the planner and this page will estimate protein, fiber, produce variety, and how much of your pantry the week uses.
            </EmptyState>
          </div>
        </div>
        <Method />
      </div>
    )
  }

  return (
    <div>
      {header}

      <div className="modules grid-cols-1 md:grid-cols-2">
        <section className="module" aria-labelledby="m-protein">
          <ModuleTitle id="m-protein" right={<EstimateTag />}>Protein</ModuleTitle>
          <ReferenceMeter
            label="Estimated protein per person per day"
            value={summary.proteinPerDay}
            reference={PROTEIN_DV}
            unit="g"
            note={<>General reference for adults is about {PROTEIN_DV} g protein/day (FDA Daily Value). Needs vary.</>}
          />
        </section>

        <section className="module" aria-labelledby="m-fiber">
          <ModuleTitle id="m-fiber" right={<EstimateTag />}>Fiber</ModuleTitle>
          <ReferenceMeter
            label="Estimated fiber per person per day"
            value={summary.fiberPerDay}
            reference={FIBER_DV}
            unit="g"
            note={<>General reference for adults is about {FIBER_DV} g fiber/day (FDA Daily Value). Needs vary.</>}
          />
        </section>

        <section className="module md:col-span-2" aria-labelledby="m-days">
          <ModuleTitle id="m-days" right={<EstimateTag>g per person</EstimateTag>}>Protein by day</ModuleTitle>
          <DailyProteinBars values={byDay} reference={PROTEIN_DV} />
        </section>

        <section className="module md:col-span-2" aria-labelledby="m-produce">
          <ModuleTitle id="m-produce" right={<span className="num text-sm font-semibold text-ink-2">{summary.produceVariety.length} in plan</span>}>
            Fruit &amp; vegetable variety
          </ModuleTitle>
          {produce.length === 0 ? (
            <p className="text-[15px] text-ink-2">No fruits or vegetables in your pantry or plan yet. Frozen and canned produce count too.</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {produce.map((p) => (
                  <li
                    key={p.id}
                    className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 text-[15px] ring-1 ring-inset ${p.inPlan ? 'bg-leaf-wash text-leaf-ink ring-leaf/50 font-semibold' : 'bg-paper text-ink-2 ring-rule'}`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-xs">{p.inPlan ? 'In plan' : 'Not in plan'}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-2">"In plan" chips are used by this week's meals (shaded green). "Not in plan" chips are on hand but not yet in a meal.</p>
            </>
          )}
        </section>

        <section className="module" aria-labelledby="m-util">
          <ModuleTitle id="m-util">Ingredient utilization</ModuleTitle>
          <p className="flex items-baseline gap-2">
            <RollingNumber value={`${utilPct}%`} className="display text-5xl text-forest" />
            <span className="text-[15px] text-ink-2">of your pantry ingredients are used</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-cream ring-1 ring-inset ring-rule" aria-hidden="true">
            <div className="h-full bg-leaf" style={{ width: `${utilPct}%` }} />
          </div>
          <IngredientList title="Used" ids={summary.usedIngredientIds} tone="have" />
          <IngredientList title="Not used yet" ids={summary.unusedIngredientIds} tone="neutral" />
        </section>

        <div className="grid gap-px bg-rule">
          <section className="module" aria-labelledby="m-meals">
            <ModuleTitle id="m-meals">Meals from what you have</ModuleTitle>
            <p className="flex items-baseline gap-2">
              <span className="display num text-5xl text-forest">{summary.mealsFromPantry}</span>
              <span className="text-[15px] text-ink-2">
                of <span className="num">{summary.mealsTotal}</span> planned meals need nothing new
              </span>
            </p>
          </section>

          <section className="module" aria-labelledby="m-cost">
            <ModuleTitle id="m-cost" right={<EstimateTag />}>Additional spending</ModuleTitle>
            <p className="flex flex-wrap items-baseline gap-2">
              <RollingNumber value={money(analysis.additionalCost)} className="display text-5xl text-forest" />
              <span className="text-[15px] text-ink-2">to finish the plan</span>
            </p>
            <p className="mt-2 text-sm text-ink-2">
              Based on typical U.S. grocery prices; your store may differ. <Link to="/planner" className="font-semibold text-forest underline">See the shopping list</Link>
            </p>
          </section>

          <section className="module" aria-labelledby="m-waste">
            <ModuleTitle id="m-waste" right={<EstimateTag />}>Food waste avoided</ModuleTitle>
            {analysis.rescued.length === 0 ? (
              <p className="text-[15px] text-ink-2">Nothing in your pantry expires within a week, or the plan doesn't use it yet.</p>
            ) : (
              <>
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="display num text-5xl text-forest">{money(rescuedValue)}</span>
                  {rescuedGrams > 0 && <span className="num text-[15px] text-ink-2">about {Math.round(rescuedGrams).toLocaleString('en-US')} g of soon-expiring food</span>}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {analysis.rescued.map((r) => {
                    const ing = INGREDIENT_BY_ID[r.ingredientId]
                    const a = displayAmount(ing, r.base)
                    return (
                      <li key={r.ingredientId}>
                        <Tag tone="have" icon={<Leaf size={12} aria-hidden="true" />}>
                          {ing.name} · <span className="num">{formatQty(a.qty, a.unit)}</span>
                        </Tag>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>

      <Method />
    </div>
  )
}

function IngredientList({ title, ids, tone }: { title: string; ids: string[]; tone: 'have' | 'neutral' }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-ink">
        {title} <span className="num font-normal text-ink-2">({ids.length})</span>
      </h3>
      {ids.length === 0 ? (
        <p className="mt-1 text-sm text-ink-2">None</p>
      ) : (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {ids.map((id) => (
            <li key={id}>
              <Tag tone={tone} className="text-[13px]">{nameOf(id)}</Tag>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Method() {
  return (
    <details className="group modules mt-6">
      <summary className="module flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em] text-forest">How these estimates work</span>
        <ChevronDown size={18} className="text-forest motion-safe:transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="module space-y-3 text-[15px] leading-relaxed text-ink-2">
        <p>
          Each ingredient uses rounded reference values per 100 g from{' '}
          <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline">
            USDA FoodData Central<span className="sr-only"> (opens in a new tab)</span>
          </a>
          . We add up the planned recipes, scale them to your servings, and divide by your household size and the number of days planned.
        </p>
        <p>Results depend on actual quantities, brands, and preparation, so treat them as a rough guide. Leftover meals repeat the values of the meal they came from.</p>
        <p>Reference amounts are FDA Daily Values for adults (protein 50 g, fiber 28 g). Children, older adults, and people who are pregnant or active may need different amounts.</p>
        <p className="font-semibold text-ink">This is not medical or dietary advice. Talk to a doctor or registered dietitian about your personal needs.</p>
      </div>
    </details>
  )
}
